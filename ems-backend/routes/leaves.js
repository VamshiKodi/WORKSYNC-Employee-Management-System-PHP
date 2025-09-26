const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { auth, roleAuth } = require('../middleware/auth');
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }
  next();
};

// Create a new leave request (Employee)
router.post(
  '/',
  auth,
  [
    body('type').isIn(['annual', 'sick', 'unpaid', 'casual', 'other']).withMessage('Invalid leave type'),
    body('startDate').isISO8601().toDate(),
    body('endDate').isISO8601().toDate(),
    body('reason').optional().isString().isLength({ max: 500 }),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { type, startDate, endDate, reason } = req.body;

      // find employee doc linked to this user
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee) {
        return res.status(400).json({ message: 'Employee record not found for the user' });
      }

      const days = Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1);

      const leave = await LeaveRequest.create({
        employeeId: employee._id,
        type,
        startDate,
        endDate,
        days,
        reason,
        status: 'pending',
      });
      res.status(201).json({ success: true, leave });
    } catch (err) {
      console.error('Create leave error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get my leaves (Employee)
router.get('/my', auth, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(400).json({ message: 'Employee record not found for the user' });
    }

    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const q = { employeeId: employee._id };
    if (status) q.status = status;
    if (startDate || endDate) {
      q.startDate = {};
      if (startDate) q.startDate.$gte = new Date(startDate);
      if (endDate) q.startDate.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      LeaveRequest.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      LeaveRequest.countDocuments(q),
    ]);

    res.json({ success: true, items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error('Get my leaves error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin/HR: list leaves with filters
router.get(
  '/',
  roleAuth(['admin', 'hr']),
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']),
    query('employeeId').optional().isMongoId(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { status, employeeId, startDate, endDate, page = 1, limit = 10 } = req.query;
      const q = {};
      if (status) q.status = status;
      if (employeeId) q.employeeId = employeeId;
      if (startDate || endDate) {
        q.startDate = {};
        if (startDate) q.startDate.$gte = new Date(startDate);
        if (endDate) q.startDate.$lte = new Date(endDate);
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [items, total] = await Promise.all([
        LeaveRequest.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('employeeId', 'firstName lastName department position'),
        LeaveRequest.countDocuments(q),
      ]);

      res.json({ success: true, items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err) {
      console.error('List leaves error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get single leave
router.get('/:id', auth, [param('id').isMongoId()], handleValidation, async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id).populate('employeeId', 'firstName lastName department position');
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    // employees can view only own; admins/hr any
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee || String(leave.employeeId._id) !== String(employee._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ success: true, leave });
  } catch (err) {
    console.error('Get leave error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update leave (only when pending; employee can update own)
router.put('/:id', auth, [param('id').isMongoId()], handleValidation, async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be updated' });

    const employee = await Employee.findOne({ user: req.user._id });
    const isOwner = employee && String(leave.employeeId) === String(employee._id);
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'hr';

    if (!isOwner && !isPrivileged) return res.status(403).json({ message: 'Access denied' });

    const updatable = ['type', 'startDate', 'endDate', 'reason'];
    updatable.forEach((k) => {
      if (req.body[k] !== undefined) leave[k] = req.body[k];
    });

    if (leave.startDate && leave.endDate) {
      leave.days = Math.max(0, Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1);
    }

    await leave.save();
    res.json({ success: true, leave });
  } catch (err) {
    console.error('Update leave error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel leave (employee owner) or delete (admin/hr)
router.delete('/:id', auth, [param('id').isMongoId()], handleValidation, async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    const employee = await Employee.findOne({ user: req.user._id });
    const isOwner = employee && String(leave.employeeId) === String(employee._id);

    if (req.user.role === 'employee') {
      if (!isOwner) return res.status(403).json({ message: 'Access denied' });
      leave.status = 'cancelled';
      await leave.save();
      return res.json({ success: true, leave });
    }

    if (req.user.role === 'admin' || req.user.role === 'hr') {
      await leave.deleteOne();
      return res.json({ success: true, message: 'Leave deleted' });
    }

    res.status(403).json({ message: 'Access denied' });
  } catch (err) {
    console.error('Delete leave error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve leave (Admin/HR)
router.put('/:id/approve', roleAuth(['admin', 'hr']), [param('id').isMongoId()], handleValidation, async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be approved' });

    const approver = await Employee.findOne({ user: req.user._id });
    leave.status = 'approved';
    leave.approvedBy = approver ? approver._id : undefined;
    leave.approvedAt = new Date();
    leave.comments = req.body.comments;
    await leave.save();
    res.json({ success: true, leave });
  } catch (err) {
    console.error('Approve leave error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject leave (Admin/HR)
router.put('/:id/reject', roleAuth(['admin', 'hr']), [param('id').isMongoId(), body('comments').optional().isString()], handleValidation, async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be rejected' });

    const approver = await Employee.findOne({ user: req.user._id });
    leave.status = 'rejected';
    leave.approvedBy = approver ? approver._id : undefined;
    leave.approvedAt = new Date();
    leave.comments = req.body.comments;
    await leave.save();
    res.json({ success: true, leave });
  } catch (err) {
    console.error('Reject leave error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
