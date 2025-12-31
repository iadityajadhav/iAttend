const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');

exports.registerStudent = async (req, res) => {
  try {
    const { name, userId, collegeId, password, branch, year, sem, roll } = req.body;

    // 1️⃣ Check if student with same userId already exists
    const existingUserId = await Student.findOne({ userId: String(userId).trim().toLowerCase() });
    if (existingUserId) {
      return res.status(400).json({ message: 'UserId already exists' });
    }

    // 2️⃣ Validate collegeId
    const admin = await Admin.findOne({ collegeId: String(collegeId).trim()});
    if (!admin) {
      return res.status(400).json({
        message: 'Wrong College Id! Ask your college admin if you don’t know it.',
      });
    }

    // 3️⃣ Find class (branch, year, sem) in admin’s classes
    const matchingClass = admin.classes.find(
      (cls) =>
        cls.branch.trim().toLowerCase() === branch.trim().toLowerCase() &&
        cls.year.trim().toLowerCase() === year.trim().toLowerCase() &&
        Number(cls.sem) === Number(sem)
    );

    // 4️⃣ Get subjects if found
    const subjectsToAssign = matchingClass ? matchingClass.subjects : [];

    // 5️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6️⃣ Create student with auto subjects
    const student = await Student.create({
      name: name.trim(),
      userId: userId.trim().toLowerCase(),
      collegeId: collegeId.trim().toLowerCase(),
      password: hashedPassword,
      branch: branch.trim(),
      year: year.trim(),
      sem: Number(sem),
      roll: Number(roll),
      subjects: subjectsToAssign,
    });

    // 7️⃣ Respond success
    res.status(201).json({
      success: true,
      message: matchingClass
        ? `Student registered successfully with ${subjectsToAssign.length} subjects added automatically`
        : `Student registered successfully, but no subjects found for ${branch}, ${year}, Sem ${sem}`,
      studentId: student._id,
      subjects: subjectsToAssign,
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentSubjectAttendance = async (req, res) => {
  try {
    const student = req.user;
    const { subject, branch, year, sem } = req.query;

    if (!subject || !branch || !year || !sem) {
      return res.status(400).json({ message: 'subject, branch, year, and sem are required' });
    }

    // 1️⃣ Fetch all sessions for this subject
    const sessions = await AttendanceSession.find({
      branch: branch.trim(),
      year: year.trim(),
      sem: Number(sem),
      subject: subject.trim(),
    });

    // 2️⃣ Fetch manually added attendance records for this student with sessionId = null
    const manualAttendanceRecords = await AttendanceRecord.find({
      userId: student.userId,
      subject: subject.trim(),
      branch: branch.trim(),
      year: year.trim(),
      sem: Number(sem),
      sessionId: null,
    });

    // 3️⃣ Total lectures = sessions + unique manual records
    const uniqueManualLectures = new Set(
      manualAttendanceRecords.map(r => `${r.lectureNumber}-${r.date}`)
    );

    const totalLectures = sessions.length + uniqueManualLectures.size;

    // 4️⃣ Count student presents
    const totalPresent = await AttendanceRecord.countDocuments({
      userId: student.userId,
      subject: subject.trim(),
      branch: branch.trim(),
      year: year.trim(),
      sem: Number(sem),
    });

    // 5️⃣ Calculate absent & percentage
    const totalAbsent = totalLectures - totalPresent;
    const attendancePercentage = totalLectures === 0 ? 0 : ((totalPresent / totalLectures) * 100).toFixed(2);

    res.status(200).json({
      success: true,
      student: {
        name: student.name,
        userId: student.userId,
        branch,
        year,
        sem,
      },
      subject,
      totalLectures,
      totalPresent,
      totalAbsent,
      attendancePercentage: `${attendancePercentage}%`,
    });

  } catch (err) {
    console.error('Error fetching student attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.studentViewAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { subject } = req.query;

    if (!subject)
      return res.status(400).json({ message: "Subject is required" });

    // 1️⃣ Get ALL lectures conducted for this subject
    const allLectures = await AttendanceRecord.find({
      subject,
    }).select("date lectureNumber");

    if (!allLectures.length) {
      return res.json({
        success: true,
        subject,
        totalLectures: 0,
        present: 0,
        absent: 0,
        percentage: 0,
        records: [],
      });
    }

    // Unique lectures
    const lectureSet = new Map();
    allLectures.forEach((l) => {
      lectureSet.set(`${l.date}|${l.lectureNumber}`, l);
    });

    const totalLectures = lectureSet.size;

    // 2️⃣ Student's attendance
    const studentRecords = await AttendanceRecord.find({
      studentId,
      subject,
    });

    const presentSet = new Set(
      studentRecords.map(
        (r) => `${r.date}|${r.lectureNumber}`
      )
    );

    // 3️⃣ Build final attendance list
    const attendance = [...lectureSet.keys()].map((key) => {
      const [date, lectureNumber] = key.split("|");
      return {
        date,
        lectureNumber: Number(lectureNumber),
        status: presentSet.has(key) ? "Present" : "Absent",
      };
    });

    const present = attendance.filter(a => a.status === "Present").length;
    const absent = totalLectures - present;
    const percentage = ((present / totalLectures) * 100).toFixed(0);

    res.json({
      success: true,
      subject,
      totalLectures,
      present,
      absent,
      percentage,
      attendance,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
