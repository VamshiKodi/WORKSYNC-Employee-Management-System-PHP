const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { auth, adminAuth } = require('../middleware/auth');
const Employee = require('../models/Employee');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/employees
// @desc    Get all employees (Admin/HR only)
// @access  Private (Admin/HR)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const employees = await Employee.find().populate('manager', 'firstName lastName');
    res.json({ success: true, employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/employees/:id/credentials
// @desc    Update employee's user credentials (Admin only)
// @access  Private (Admin)
router.put('/:id/credentials', auth, adminAuth, async (req, res) => {
  try {
    const { username, password } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!employee.user) {
      return res.status(400).json({ message: 'No linked user for this employee' });
    }

    const user = await User.findById(employee.user);
    if (!user) {
      return res.status(404).json({ message: 'Linked user not found' });
    }

    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (password) {
      user.password = password; // will be hashed by pre-save hook
    }

    await user.save();

    return res.json({ success: true, message: 'Credentials updated successfully', user: user.toJSON() });
  } catch (error) {
    console.error('Update credentials error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/employees
// @desc    Create new employee (Admin/HR only)
// @access  Private (Admin/HR)
router.post('/', [
  auth,
  adminAuth,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('department').notEmpty().withMessage('Department is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }

  const { firstName, lastName, email, username, password, ...otherFields } = req.body;

  try {
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'A user with this email already exists.' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'This username is already taken.' });
      }
    }

    const newUser = new User({
      username,
      email,
      password,
      role: 'employee'
    });
    await newUser.save();

    const employee = await Employee.create({
      ...otherFields,
      firstName,
      lastName,
      email,
      user: newUser._id,
      employeeId: otherFields.employeeId || `EMP${Date.now()}`
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee
    });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (Admin/HR) or Employee (own profile)
router.put('/:id', [
  auth,
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }

  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const user = req.user;
    if (user.role === 'employee' && user.employeeId?.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this employee' });
    }

    if (req.body.email && req.body.email !== employee.email) {
      const existingEmail = await Employee.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName');

    res.json({
      success: true,
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (Admin only)
// @access  Private (Admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete associated user if linked
    if (employee.user) {
      await User.findByIdAndDelete(employee.user);
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Employee and associated user deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
