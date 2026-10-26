const express = require('express');
const router = express.Router();

const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getStats,
  seedEmployees,
  getDepartments,
  createDepartment
} = require('../controllers/employeeController');

// Department routes
router.route('/departments').get(getDepartments).post(createDepartment);

// Stats and seeding routes (placed before :id to prevent collision)
router.get('/stats/summary', getStats);
router.post('/seed', seedEmployees);

// Main CRUD routes
router
  .route('/')
  .get(getEmployees)
  .post(createEmployee);

router
  .route('/:id')
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
