const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const models = { admin: Admin, teacher: Teacher, student: Student };

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;  // role comes from JWT
    const Model = models[role];
    const user = await Model.findById(id).select('-password -classes -deleteRequestedAt');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const Model = models[role];
    const updates = { ...req.body };

    const updatedUser = await Model.findByIdAndUpdate(id, updates, { new: true }).select('-password');;

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ success: true, user: updatedUser, message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update password
exports.updatePassword = (role) => async (req, res) => {
  try {
    const { id } = req.user; // from auth middleware
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    const Model = models[role];
    const user = await Model.findById(id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//LOGIC FOR LOGOUT
let tokenBlacklist = []; // Temporary in-memory blacklist (for production use Redis or DB)

exports.tokenBlacklist = tokenBlacklist;

exports.logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token before blacklisting (optional but safer)
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Add token to blacklist
    tokenBlacklist.push(token);

    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// Function to check if a token is blacklisted
exports.isTokenBlacklisted = (token) => tokenBlacklist.includes(token);

// LOGIC FOR ACCOUNT DELETION
exports.requestAccountDeletion = (userrole) => async (req, res, next) => {
  try {
    const { userId, confirmText } = req.body; // frontend sends role + userId + confirmation
    
    const role = userrole;

    if (confirmText !== `Delete ${userId}`) {
      return res.status(400).json({ message: 'Confirmation text does not match. Write your user ID in lowercase if not' });
    }

    const Model = models[role];
    const user = await Model.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Schedule deletion
    user.deleteRequestedAt = new Date();
    await user.save();

    // Calculate deletion date (30 days later)
    const deletionDate = new Date(user.deleteRequestedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    res.status(200).json({
    success: true,
    message: `Account deletion scheduled. Your account will be permanently deleted on ${deletionDate.toDateString()} if you don't log in before that.`,
    deletionDate: deletionDate
    });


  } catch (err) {
    next(err);
  }
};

