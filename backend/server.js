// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
require('./cron/deleteAccounts'); // will run automatically
const attendanceRoutes = require('./routes/attendanceRoutes');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);

app.use('/api/student', studentRoutes);

app.use('/api/teacher', teacherRoutes);

app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

// Get port from .env
const PORT = process.env.PORT;

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});