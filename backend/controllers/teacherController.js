const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

exports.registerTeacher = async (req, res, next) => {
  try {
    const { name, userId, collegeId, password } = req.body;

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ userId });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    //Check if college id exists in Admin db
    const isCollegeIdExist = await Admin.findOne({ collegeId });
    if (!isCollegeIdExist) {
      return res.status(400).json({ message: 'Wrong College Id! Ask to college admin if dont know' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new teacher
    const teacher = await Teacher.create({
      name,
      userId,
      collegeId,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      teacherId: teacher._id
    });
  } catch (err) {
    next(err);
  }
};

// Fetch classes from admin for the teacher's college
exports.getAvailableClasses = async (req, res) => {
  try {
    const teacherId = req.user.id; // from JWT

    // Fetch teacher to get their collegeId
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const collegeId = teacher.collegeId;

    // Fetch all admins in the same college
    const admins = await Admin.find({ collegeId }).select('classes');

    // Flatten all classes into a single array
    const allClasses = [];
    admins.forEach(admin => {
      if (admin.classes && admin.classes.length > 0) {
        allClasses.push(...admin.classes);
      }
    });

    res.status(200).json({ success: true, classes: allClasses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Teacher selects a class to teach
exports.addClassToProfile = async (req, res) => {
  try {
    const { id } = req.user; // teacher id from auth
    const { branch, year, sem, subject } = req.body;

    if (!branch || !year || !sem || !subject) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const teacher = await Teacher.findById(id);

    // Check if class with same branch, year, sem, subject already exists in teacher profile
    const exists = teacher.classes.some(
      cls => cls.branch === branch && cls.year === year && cls.sem === sem && cls.subject === subject
    );

    if (exists) {
      return res.status(400).json({ message: 'This class is already assigned to you' });
    }

    // Add class to teacher profile
    teacher.classes.push({ branch, year, sem, subject });
    await teacher.save();

    res.status(200).json({ success: true, message: 'Class added successfully', classes: teacher.classes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//teacher removes class from their profile
exports.removeClassFromProfile = async (req, res) => {
  try {
    const { branch, year, sem, subject } = req.body;
    const teacherId = req.user.id; // teacher ID from JWT

    if (!branch || !year || !sem || !subject) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Find if the class exists in teacher profile
    const classExists = teacher.classes.some(
      cls =>
        cls.branch === branch &&
        cls.year === year &&
        cls.sem === sem &&
        cls.subject === subject
    );

    if (!classExists) {
      return res.status(404).json({ message: 'Class not found in your profile' });
    }

    // Remove the matching class
    teacher.classes = teacher.classes.filter(
      cls =>
        !(
          cls.branch === branch &&
          cls.year === year &&
          cls.sem === sem &&
          cls.subject === subject
        )
    );

    await teacher.save();

    res.status(200).json({
      success: true,
      message: 'Class removed successfully',
      classes: teacher.classes,
    });
  } catch (err) {
    console.error('Error removing class:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//  To fetch added classes
exports.getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user.id; // teacher id from JWT

    const teacher = await Teacher.findById(teacherId).select('classes name userId collegeId');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Fetched your added classes successfully',
      teacher: {
        name: teacher.name,
        userId: teacher.userId,
        collegeId: teacher.collegeId,
      },
      classes: teacher.classes,
    });
  } catch (err) {
    console.error('Error fetching teacher classes:', err);
    res.status(500).json({ message: 'Server error' });
  }
};