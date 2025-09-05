const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Activity = require('../models/Activity');

// Build filters from query params
function buildFilters(query) {
  const { search, type, startDate, endDate, priority, userId, read } = query;
  const filters = {};

  if (type) filters.type = type;
  if (priority) filters.priority = priority;
  if (typeof read !== 'undefined') filters.read = read === 'true';

  // date range
  if (startDate || endDate) {
    filters.timestamp = {};
    if (startDate) filters.timestamp.$gte = new Date(startDate);
    if (endDate) filters.timestamp.$lte = new Date(endDate);
  }

  // text search on action/details
  if (search) {
    filters.$or = [
      { action: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } },
    ];
  }

  // filter by user id (when Activity.user is stored as ObjectId)
  if (userId) {
    filters.$or = [
      ...(filters.$or || []),
      { 'user._id': userId },
      { user: userId },
    ];
  }

  return filters;
}

// GET /api/activities - list with pagination and filters
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || 'timestamp';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const filters = buildFilters(req.query);

    const [total, data] = await Promise.all([
      Activity.countDocuments(filters),
      Activity.find(filters)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.json({ data, total, page, limit, totalPages });
  } catch (err) {
    console.error('GET /activities error:', err);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
});

// GET /api/activities/stats - aggregate simple stats
router.get('/stats', auth, async (req, res) => {
  try {
    const filters = buildFilters(req.query);

    const total = await Activity.countDocuments(filters);

    // today count
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const today = await Activity.countDocuments({
      ...filters,
      timestamp: { ...(filters.timestamp || {}), $gte: startOfDay },
    });

    const byTypeAgg = await Activity.aggregate([
      { $match: filters },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    const byType = Object.fromEntries(byTypeAgg.map((x) => [x._id, x.count]));

    const byPriorityAgg = await Activity.aggregate([
      { $match: filters },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    const byPriority = { low: 0, medium: 0, high: 0 };
    byPriorityAgg.forEach((x) => { byPriority[x._id] = x.count; });

    const byUserAgg = await Activity.aggregate([
      { $match: filters },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $limit: 10 },
    ]);
    const byUser = byUserAgg.map((x) => ({ user: x._id, count: x.count }));

    res.json({ total, today, byType, byPriority, byUser });
  } catch (err) {
    console.error('GET /activities/stats error:', err);
    res.status(500).json({ message: 'Failed to fetch activity statistics' });
  }
});

// POST /api/activities - create activity (allow any authenticated user to create for testing)
router.post('/', auth, async (req, res) => {
  try {
    const payload = req.body || {};

    // if no user specified, attach current user minimal info
    if (!payload.user && req.user) {
      payload.user = {
        _id: String(req.user._id),
        name: req.user.username || req.user.name || 'Unknown',
        email: req.user.email,
        role: req.user.role,
        department: req.user.department || 'General',
      };
    }

    const activity = await Activity.create(payload);
    res.status(201).json(activity);
  } catch (err) {
    console.error('POST /activities error:', err);
    res.status(400).json({ message: err.message || 'Failed to create activity' });
  }
});

module.exports = router;
