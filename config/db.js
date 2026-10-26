const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_management';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`⚠️  MongoDB connection notice: ${error.message}`);
    console.log(`ℹ️  Running with persistent JSON storage mode (data/employees.json).`);
    console.log(`ℹ️  To connect to MongoDB Atlas, add your URI in .env: MONGODB_URI=mongodb+srv://...`);
    return false;
  }
};

const getStatus = () => isMongoConnected;

module.exports = { connectDB, getStatus };
