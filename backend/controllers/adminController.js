const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

//for admin registration
exports.registerAdmin = async (req, res) => {
  try {
    const { name, userId, collegeId, password } = req.body;

    // ✅ Single check for both fields
    const existingAdmin = await Admin.findOne({
      $or: [{ userId }, { collegeId }]
    });

    if (existingAdmin) {
      if (existingAdmin.userId === userId && existingAdmin.collegeId === collegeId) {
        return res.status(400).json({ message: 'User ID and College ID already exist' });
      } else if (existingAdmin.userId === userId) {
        return res.status(400).json({ message: 'User ID already exists' });
      } else if (existingAdmin.collegeId === collegeId) {
        return res.status(400).json({ message: 'College ID already exists' });
      }
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create new admin
    const admin = await Admin.create({
      name,
      userId,
      collegeId,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      userID: admin.userId,
    });

  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//To add Classes to admin profile
exports.addClass = async (req, res) => {
  try {
    const adminId = req.user.id; // from authMiddleware
    const { branch, year, sem, subjects } = req.body;

    // Validate input
    if (!branch || !year || !sem || !Array.isArray(subjects)) {
      return res.status(400).json({ message: 'All fields are required and subjects must be an array' });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Check if same class already exists
    const classExists = admin.classes.some(
      cls => cls.branch === branch && cls.year === year && cls.sem === sem
    );

    if (classExists) {
      return res.status(400).json({ message: 'This class already exists in your profile' });
    }

    // Add new class
    admin.classes.push({ branch, year, sem, subjects });
    await admin.save();

    res.status(200).json({ success: true, message: 'Class added successfully', classes: admin.classes });
  } catch (err) {
    console.error('Error adding class:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { branch, year, sem, subjects, confirmText } = req.body;

    if (!branch || !year || !sem || !confirmText || !Array.isArray(subjects)) {
      return res.status(400).json({ message: 'All fields, confirmation text are required and subjects must be an array' });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Find class index
    const classIndex = admin.classes.findIndex(
      cls => cls.branch === branch && cls.year === year && cls.sem === sem
    );

    if (classIndex === -1) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Verify confirmation text
    if (confirmText !== `Update`) {
      return res.status(400).json({ message: 'Confirmation text does not match' });
    }

    // Update subjects
    admin.classes[classIndex].subjects = subjects;
    await admin.save();

    res.status(200).json({ success: true, message: 'Class updated successfully', classes: admin.classes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete class with confirmation text
exports.deleteClass = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { branch, year, sem, confirmText } = req.body;

    if (!branch || !year || !sem || !confirmText) {
      return res.status(400).json({ message: 'All fields and confirmation text are required' });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Verify confirmation text
    if (confirmText !== `Delete`) {
      return res.status(400).json({ message: 'Confirmation text does not match' });
    }

    // Filter out the class
    const initialLength = admin.classes.length;
    admin.classes = admin.classes.filter(
      cls => !(cls.branch === branch && cls.year === year && cls.sem === sem)
    );

    if (admin.classes.length === initialLength) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await admin.save();

    res.status(200).json({ success: true, message: 'Class deleted successfully', classes: admin.classes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
