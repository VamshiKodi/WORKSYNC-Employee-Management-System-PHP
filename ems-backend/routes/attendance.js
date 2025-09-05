const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/attendance/clock-in
// @desc    Clock in for the day
// @access  Private (Employee)
router.post('/clock-in', [
  auth,
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates are required'),
  body('location.coordinates.*').isNumeric().withMessage('Coordinates must be numbers')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const { location, ipAddress, deviceInfo } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance && existingAttendance.clockIn) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }

    // Create or update attendance record
    let attendance;
    if (existingAttendance) {
      attendance = existingAttendance;
    } else {
      attendance = new Attendance({
        employee: req.user.employeeId,
        date: today
      });
    }

    attendance.clockIn = {
      time: new Date(),
      location,
      ipAddress,
      deviceInfo
    };

    // Check if late
    if (attendance.isLate()) {
      attendance.status = 'late';
    }

    await attendance.save();

    res.json({
      success: true,
      message: 'Successfully clocked in',
      attendance: {
        id: attendance._id,
        clockInTime: attendance.clockIn.time,
        status: attendance.status,
        isLate: attendance.isLate()
      }
    });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/clock-out
// @desc    Clock out for the day
// @access  Private (Employee)
router.post('/clock-out', [
  auth,
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates are required'),
  body('location.coordinates.*').isNumeric().withMessage('Coordinates must be numbers')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const { location, ipAddress, deviceInfo } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({ message: 'No clock-in record found for today' });
    }

    if (attendance.clockOut && attendance.clockOut.time) {
      return res.status(400).json({ message: 'Already clocked out today' });
    }

    // Set clock out time
    attendance.clockOut = {
      time: new Date(),
      location,
      ipAddress,
      deviceInfo
    };

    await attendance.save();

    res.json({
      success: true,
      message: 'Successfully clocked out',
      attendance: {
        id: attendance._id,
        clockInTime: attendance.clockIn.time,
        clockOutTime: attendance.clockOut.time,
        totalHours: attendance.totalHours,
        status: attendance.status
      }
    });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/my-attendance
// @desc    Get current user's attendance records
// @access  Private (Employee)
router.get('/my-attendance', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 30, 
      startDate, 
      endDate,
      status 
    } = req.query;

    // Build query
    let query = { employee: req.user.employeeId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Attendance.countDocuments(query);

    // Get attendance summary
    const summary = await Attendance.getAttendanceSummary(
      req.user.employeeId,
      startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1),
      endDate ? new Date(endDate) : new Date()
    );

    res.json({
      success: true,
      attendance,
      summary,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/employee/:employeeId
// @desc    Get employee attendance records (Admin/HR only)
// @access  Private (Admin/HR)
router.get('/employee/:employeeId', auth, adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 30, 
      startDate, 
      endDate,
      status 
    } = req.query;

    // Verify employee exists
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Build query
    let query = { employee: req.params.employeeId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('employee', 'firstName lastName employeeId department');

    // Get total count
    const total = await Attendance.countDocuments(query);

    // Get attendance summary
    const summary = await Attendance.getAttendanceSummary(
      req.params.employeeId,
      startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1),
      endDate ? new Date(endDate) : new Date()
    );

    res.json({
      success: true,
      employee: {
        id: employee._id,
        name: employee.fullName,
        employeeId: employee.employeeId,
        department: employee.department,
        position: employee.position
      },
      attendance,
      summary,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/all
// @desc    Get all attendance records (Admin/HR only)
// @access  Private (Admin/HR)
router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      startDate, 
      endDate,
      status,
      department,
      employeeId
    } = req.query;

    // Build query
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      query.status = status;
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    // Execute query with pagination
    let attendanceQuery = Attendance.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('employee', 'firstName lastName employeeId department position');

    // Filter by department if specified
    if (department) {
      attendanceQuery = attendanceQuery.populate({
        path: 'employee',
        match: { department: department }
      });
    }

    const attendance = await attendanceQuery;

    // Filter out records where employee is null (due to department filter)
    const filteredAttendance = attendance.filter(record => record.employee);

    // Get total count
    let totalQuery = Attendance.find(query);
    if (department) {
      totalQuery = totalQuery.populate({
        path: 'employee',
        match: { department: department }
      });
    }
    const totalRecords = await totalQuery;
    const total = totalRecords.filter(record => record.employee).length;

    res.json({
      success: true,
      attendance: filteredAttendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/attendance/:id/approve
// @desc    Approve attendance record (Admin/HR only)
// @access  Private (Admin/HR)
router.put('/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    attendance.isApproved = true;
    attendance.approvedBy = req.user.id;
    attendance.approvedAt = new Date();

    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance record approved',
      attendance
    });
  } catch (error) {
    console.error('Approve attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record (Admin/HR only)
// @access  Private (Admin/HR)
router.put('/:id', [
  auth,
  adminAuth,
  body('clockIn.time').optional().isISO8601().withMessage('Valid clock in time is required'),
  body('clockOut.time').optional().isISO8601().withMessage('Valid clock out time is required'),
  body('status').optional().isIn(['present', 'absent', 'late', 'half-day', 'on-leave']).withMessage('Valid status is required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Update attendance
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId department');

    res.json({
      success: true,
      message: 'Attendance record updated',
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/stats/overview
// @desc    Get attendance statistics (Admin/HR only)
// @access  Private (Admin/HR)
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get attendance statistics
    const stats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$totalHours' }
        }
      }
    ]);

    // Get daily attendance for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            },
            absent: {
              $sum: {
                $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
              }
            },
            late: {
              $sum: {
                $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
              }
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get department-wise attendance
    const departmentStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      {
        $unwind: '$employeeData'
      },
      {
        $group: {
          _id: '$employeeData.department',
          totalRecords: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
            }
          },
          late: {
            $sum: {
              $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          attendanceRate: {
            $multiply: [
              {
                $divide: [
                  { $add: ['$present', '$late'] },
                  { $add: ['$present', '$late', '$absent'] }
                ]
              },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        summary: stats,
        daily: dailyStats,
        departments: departmentStats
      }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/current-status
// @desc    Get current attendance status for employee
// @access  Private (Employee)
router.get('/current-status', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    const status = {
      hasClockedIn: false,
      hasClockedOut: false,
      clockInTime: null,
      clockOutTime: null,
      totalHours: 0,
      status: 'not-started'
    };

    if (attendance) {
      status.hasClockedIn = !!attendance.clockIn;
      status.hasClockedOut = !!attendance.clockOut;
      status.clockInTime = attendance.clockIn?.time;
      status.clockOutTime = attendance.clockOut?.time;
      status.totalHours = attendance.totalHours || 0;
      status.status = attendance.status;
    }

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Get current status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 