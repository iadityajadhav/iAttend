const AttendanceRecord = require('../models/AttendanceRecord');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// 📘 GET /api/attendance/teacher/view
// Teacher views attendance for subject (optional date)
exports.getAttendanceBySubject = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { branch, year, sem, subject, date } = req.query;

    if (!branch || !year || !sem || !subject) {
      return res.status(400).json({ message: 'Branch, year, sem, and subject are required' });
    }

    // ✅ Validate teacher
    const teacher = await Teacher.findById(teacherId).select('collegeId name');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // ✅ Fetch students WITHOUT lowercasing (case-sensitive fix)
    const students = await Student.find({
      collegeId: teacher.collegeId,
      branch: branch,
      year: year,
      sem: Number(sem),
    }).select('name userId roll _id');

    if (!students.length) {
      return res.status(404).json({ message: 'No students found for this class' });
    }

    const studentIds = students.map(s => s._id);
    const dateFilter = date ? { date } : {};

    // ✅ Fetch attendance records
    const attendanceRecords = await AttendanceRecord.find({
      studentId: { $in: studentIds },
      subject: subject,
      ...dateFilter,
    }).select('studentId date');

    // ✅ Group attendance by student
    const attendanceMap = new Map();
    attendanceRecords.forEach(rec => {
      const key = rec.studentId.toString();
      if (!attendanceMap.has(key)) attendanceMap.set(key, []);
      attendanceMap.get(key).push(rec.date);
    });

    // ✅ Build response
    const data = students.map(stu => ({
      name: stu.name,
      roll: stu.roll,
      userId: stu.userId,
      studentId: stu._id,
      status: date
        ? (attendanceMap.has(stu._id.toString()) ? 'Present' : 'Absent')
        : `${attendanceMap.get(stu._id.toString())?.length || 0} Lectures Present`,
    }));

    res.status(200).json({
      success: true,
      message: date
        ? `Attendance for ${subject} on ${date}`
        : `Attendance summary for ${subject}`,
      totalStudents: students.length,
      data,
    });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Teacher updates student attendance manually
// ✏️ PUT /api/attendance/teacher/update
exports.updateAttendanceStatus = async (req, res) => {
  try {
    const teacher = req.user;
    const { userId, subject, date, lectureNumber, status } = req.body;

    if (!userId || !subject || !date || !lectureNumber || !status) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const student = await Student.findOne({ userId: String(userId).trim() });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const existingRecord = await AttendanceRecord.findOne({
      userId: String(userId).trim(),
      subject: String(subject).trim().toLowerCase(),
      date,
      lectureNumber,
    });

    if (status.toLowerCase() === 'present') {
      if (existingRecord) {
        return res.status(200).json({ message: 'Already marked as present' });
      }

      await AttendanceRecord.create({
        studentId: student._id,
        sessionId: null, // manually added
        collegeId: String(student.collegeId).trim().toLowerCase(),
        name: student.name,
        userId: student.userId,
        roll: student.roll,
        branch: String(student.branch).trim(),
        year: String(student.year).trim(),
        sem: Number(student.sem),
        subject: String(subject).trim(),
        lectureNumber,
        date,
      });

      return res.status(201).json({ success: true, message: 'Marked as present' });

    } else if (status.toLowerCase() === 'absent') {
      if (existingRecord) {
        await existingRecord.deleteOne();
        return res.status(200).json({ success: true, message: 'Marked as absent' });
      } else {
        return res.status(200).json({ message: 'Already absent' });
      }

    } else {
      return res.status(400).json({ message: 'Invalid status, must be Present or Absent' });
    }
  } catch (err) {
    console.error('Error updating attendance:', err.message, err.stack);
    res.status(500).json({ message: err.message });
  }
};


