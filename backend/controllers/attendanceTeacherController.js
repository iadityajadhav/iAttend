const AttendanceRecord = require('../models/AttendanceRecord');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// 📘 GET /api/attendance/teacher/view
// Teacher views attendance for subject (optional date)
exports.getAttendanceBySubject = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const { branch, year, sem, subject, date } = req.query;

    // 1️⃣ Get teacher details
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const collegeId = teacher.collegeId;

    // 2️⃣ Validate class belongs to teacher
    const classExists = teacher.classes.some(
      cls =>
        cls.branch === branch &&
        cls.year === year &&
        cls.sem == sem &&
        cls.subject === subject
    );

    if (!classExists) {
      return res.status(403).json({
        message: 'You are not assigned to this class',
      });
    }

    // 3️⃣ Build filter for attendance
    const filter = {
      collegeId,
      branch,
      year,
      sem,
      subject,
    };

    if (date) {
      filter.date = date;
    }

    // 4️⃣ Fetch attendance records
    const records = await AttendanceRecord.find(filter)
      .sort({ date: 1, lectureNumber: 1 })
      .select(
        'name userId roll date lectureNumber attendedAt'
      );

    if (!records.length) {
      return res.status(200).json({
        success: true,
        message: 'No attendance records found',
        data: [],
      });
    }

    // 5️⃣ Group by student
    const grouped = {};

    records.forEach((rec) => {
      if (!grouped[rec.userId]) {
        grouped[rec.userId] = {
          name: rec.name,
          roll: rec.roll,
          userId: rec.userId,
          attendance: [],
        };
      }

      grouped[rec.userId].attendance.push({
        date: rec.date,
        lectureNumber: rec.lectureNumber,
        attendedAt: rec.attendedAt,
      });
    });

    res.status(200).json({
      success: true,
      subject,
      branch,
      year,
      sem,
      totalStudents: Object.keys(grouped).length,
      records: Object.values(grouped),
    });

  } catch (error) {
    console.error('Attendance fetch error:', error);
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
      subject: String(subject).trim(),
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


