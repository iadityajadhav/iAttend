const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const Student = require('../models/Student');

// Helper: Generate random 5-digit code
const generateCode = () => Math.floor(10000 + Math.random() * 90000).toString();

// ------------------- TEACHER STARTS ATTENDANCE -------------------
exports.startAttendance = async (req, res) => {
  try {
    const { branch, year, sem, subject, lectureNumber, validForSeconds } = req.body;
    const teacher = req.user;

    if (!branch || !year || !sem || !subject || !lectureNumber || !validForSeconds) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + Number(validForSeconds) * 1000);

    // Create the attendance session
    const session = await AttendanceSession.create({
      teacherId: teacher.id,
      collegeId: String(teacher.collegeId).trim().toLowerCase(),
      branch: String(branch).trim(),
      year: String(year).trim(),
      sem: Number(sem),
      subject: String(subject).trim(),
      lectureNumber: Number(lectureNumber),
      code,
      expiresAt,
    });

    // Fetch students in the class to simulate notification
    const students = await Student.find({
      collegeId: String(teacher.collegeId).trim().toLowerCase(),
      branch: String(branch).trim(),
      year: String(year).trim(),
      sem: Number(sem),
    }).select('name userId roll');

    console.log(`📢 Notifying ${students.length} students for lecture ${lectureNumber} (${subject})`);

    res.status(201).json({
      success: true,
      message: 'Attendance session started',
      code,
      expiresAt,
      totalStudents: students.length,
    });
  } catch (err) {
    console.error('Error starting attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------- STUDENT MARKS ATTENDANCE -------------------
exports.markAttendance = async (req, res) => {
  try {
    const { code } = req.body;
    const student = req.user;

    console.log('Decoded student from JWT:', student);

    // Normalize all strings to lowercase for query
    const session = await AttendanceSession.findOne({
      code: String(code).trim(),
      isActive: true,
      collegeId: String(student.collegeId).trim().toLowerCase(),
      branch: String(student.branch).trim(),
      year: String(student.year).trim(),
      sem: Number(student.sem),
    });

    if (!session) {
      console.log('No matching attendance session found with these params:');
      console.log({
        code,
        collegeId: student.collegeId,
        branch: student.branch,
        year: student.year,
        sem: student.sem,
      });
      return res.status(400).json({ message: 'Invalid or expired attendance code' });
    }

    if (new Date() > session.expiresAt) {
      session.isActive = false;
      await session.save();
      return res.status(400).json({ message: 'Attendance session expired' });
    }

    const today = new Date().toISOString().split('T')[0];

    const alreadyMarked = await AttendanceRecord.findOne({
      studentId: student.id || student._id,
      date: today,
      lectureNumber: session.lectureNumber,
      subject: session.subject,
    });

    if (alreadyMarked) {
      return res.status(400).json({ message: 'Attendance already marked for this lecture' });
    }

    await AttendanceRecord.create({
      studentId: student.id || student._id,
      sessionId: session._id,
      collegeId: String(student.collegeId).trim().toLowerCase(),
      name: student.name,
      userId: student.userId,
      roll: student.roll,
      branch: String(student.branch).trim(),
      year: String(student.year).trim(),
      sem: Number(student.sem),
      subject: session.subject,
      lectureNumber: session.lectureNumber,
      date: today,
    });

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully for Lecture ${session.lectureNumber}, of subject ${session.subject}`,
    });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
