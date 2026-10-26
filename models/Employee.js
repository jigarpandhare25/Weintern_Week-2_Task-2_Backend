const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      minlength: [2, 'Department name must be at least 2 characters long'],
      maxlength: [60, 'Department name cannot exceed 60 characters']
    },
    role: {
      type: String,
      required: [true, 'Role/Designation is required'],
      trim: true,
      minlength: [2, 'Role must be at least 2 characters long'],
      maxlength: [80, 'Role cannot exceed 80 characters']
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [1, 'Salary must be greater than 0']
    },
    joinDate: {
      type: Date,
      required: [true, 'Join date is required'],
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Terminated'],
      default: 'Active'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for rapid text search across name, role, department, and email
employeeSchema.index({ name: 'text', role: 'text', department: 'text', email: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
