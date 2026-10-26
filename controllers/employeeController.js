const storageService = require('../services/storageService');

const VALID_DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations'
];

// Helper to validate employee inputs
const validateEmployeeInput = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push('Employee name is required and must be at least 2 characters.');
    }
  }

  if (!isUpdate || data.department !== undefined) {
    if (!data.department || typeof data.department !== 'string' || data.department.trim().length < 2) {
      errors.push('Department is required and must be at least 2 characters.');
    }
  }

  if (!isUpdate || data.role !== undefined) {
    if (!data.role || typeof data.role !== 'string' || data.role.trim().length < 2) {
      errors.push('Role/Designation is required and must be at least 2 characters.');
    }
  }

  if (!isUpdate || data.salary !== undefined) {
    const salaryNum = Number(data.salary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      errors.push('Salary must be a positive number greater than 0.');
    }
  }

  if (!isUpdate || data.joinDate !== undefined) {
    if (!data.joinDate || isNaN(new Date(data.joinDate).getTime())) {
      errors.push('A valid join date is required.');
    }
  }

  if (data.email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Please provide a valid email address.');
    }
  }

  return errors;
};

// @desc    Get all employees (with search, department filter, and sorting)
// @route   GET /api/employees
// @access  Public
exports.getEmployees = async (req, res, next) => {
  try {
    const { search, department, sortBy, order, status } = req.query;
    const employees = await storageService.getAllEmployees({
      search,
      department,
      sortBy,
      order,
      status
    });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Public
exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await storageService.getEmployeeById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: `Employee not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Public
exports.createEmployee = async (req, res, next) => {
  try {
    const errors = validateEmployeeInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors
      });
    }

    const employee = await storageService.createEmployee(req.body);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Public
exports.updateEmployee = async (req, res, next) => {
  try {
    const errors = validateEmployeeInput(req.body, true);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors
      });
    }

    const updatedEmployee = await storageService.updateEmployee(req.params.id, req.body);

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        error: `Employee not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Public
exports.deleteEmployee = async (req, res, next) => {
  try {
    const deletedEmployee = await storageService.deleteEmployee(req.params.id);

    if (!deletedEmployee) {
      return res.status(404).json({
        success: false,
        error: `Employee not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: deletedEmployee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/employees/stats/summary
// @access  Public
exports.getStats = async (req, res, next) => {
  try {
    const stats = await storageService.getStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed mock employees
// @route   POST /api/employees/seed
// @access  Public
exports.seedEmployees = async (req, res, next) => {
  try {
    const data = await storageService.seedEmployees();
    res.status(200).json({
      success: true,
      message: 'Database successfully seeded with demo records',
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available departments
// @route   GET /api/departments
// @access  Public
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await storageService.getAllDepartments();
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new department
// @route   POST /api/departments
// @access  Public
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Department name is required and must be at least 2 characters long'
      });
    }

    const newDept = await storageService.createDepartment(name, description);
    res.status(201).json({
      success: true,
      message: `Department '${newDept}' created successfully`,
      data: newDept
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
