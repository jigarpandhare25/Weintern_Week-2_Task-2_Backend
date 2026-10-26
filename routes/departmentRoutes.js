const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment } = require('../controllers/employeeController');

router
  .route('/')
  .get(getDepartments)
  .post(createDepartment);

module.exports = router;
