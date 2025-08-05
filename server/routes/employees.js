const express = require('express');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all employees with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      status = 'active',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Add filters
    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const employees = await Employee.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('manager', 'firstName lastName employeeId');

    const total = await Employee.countDocuments(query);

    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error while fetching employees' });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('manager', 'firstName lastName employeeId position');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ employee });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error while fetching employee' });
  }
});

// Create new employee
router.post('/', [
  authenticateToken,
  body('employeeId').notEmpty().trim().escape(),
  body('firstName').notEmpty().trim().escape(),
  body('lastName').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('department').notEmpty().trim().escape(),
  body('position').notEmpty().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if employee ID or email already exists
    const existingEmployee = await Employee.findOne({
      $or: [
        { employeeId: req.body.employeeId },
        { email: req.body.email }
      ]
    });

    if (existingEmployee) {
      return res.status(400).json({
        message: 'Employee with this ID or email already exists'
      });
    }

    const employee = new Employee(req.body);
    await employee.save();

    res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error while creating employee' });
  }
});

// Update employee
router.put('/:id', [
  authenticateToken,
  body('firstName').optional().trim().escape(),
  body('lastName').optional().trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('department').optional().trim().escape(),
  body('position').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName employeeId');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error while updating employee' });
  }
});

// Delete employee (soft delete - change status to terminated)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: 'terminated' },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      message: 'Employee terminated successfully',
      employee
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error while terminating employee' });
  }
});

// Get employee statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const departmentStats = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const recentHires = await Employee.find({ status: 'active' })
      .sort({ hireDate: -1 })
      .limit(5)
      .select('firstName lastName position hireDate');

    res.json({
      totalEmployees,
      departmentStats,
      recentHires
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;