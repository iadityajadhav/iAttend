const express = require('express');
const router = express.Router();
const { startAttendance, markAttendance } = require('../controllers/attendanceController');
const authMiddleware = require('../middlewares/authMiddleware');
const { getAttendanceBySubject, updateAttendanceStatus } = require('../controllers/attendanceTeacherController');

// Teacher starts attendance
router.post('/start', authMiddleware, startAttendance);

// Student marks attendance
router.post('/mark', authMiddleware, markAttendance);

//GET http://localhost:5000/api/attendance/teacher/view?branch=CS&year=FE&sem=1&subject=AI&date=2025-10-22 → Shows Present/Absent for each student that day.
//GET http://localhost:5000/api/attendance/teacher/view?branch=CS&year=FE&sem=1&subject=AI → Shows how many lectures each student attended.
router.get('/teacher/view', authMiddleware, getAttendanceBySubject);

//PUT http://localhost:5000/api/attendance/teacher/update → Update Attendance Manually
router.put('/teacher/update', authMiddleware, updateAttendanceStatus);

module.exports = router;
