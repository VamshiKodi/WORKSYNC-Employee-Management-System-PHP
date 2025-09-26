const express = require('express');
const { roleAuth } = require('../middleware/auth');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

const router = express.Router();

// GET /api/departments/stats/overview
// Returns per-department headcount and average salary, plus attendance summary for last 30 days
router.get('/stats/overview', roleAuth(['admin', 'hr']), async (req, res) => {
  try {
    const now = new Date();
    const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Aggregate employees per department
    const departmentAgg = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
        },
      },
      { $project: { department: '$_id', _id: 0, count: 1, avgSalary: { $round: ['$avgSalary', 2] } } },
      { $sort: { department: 1 } },
    ]);

    // Attendance summary since 'since'
    const attendanceAgg = await Attendance.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $project: { status: '$_id', _id: 0, count: 1 } },
    ]);

    res.json({
      success: true,
      since,
      departments: departmentAgg,
      attendanceSummary: attendanceAgg,
    });
  } catch (err) {
    console.error('Department stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
