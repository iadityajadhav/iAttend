const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

exports.loginUser = (role) => async (req, res, next) => {
  try {
    const { userId, password } = req.body;

    let Model;
    if (role === 'admin') Model = Admin;
    else if (role === 'teacher') Model = Teacher;
    else if (role === 'student') Model = Student;
    else return res.status(400).json({ message: 'Invalid role' });

    const user = await Model.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'Invalid userId or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid userId or password' });

    if (user.deleteRequestedAt) {
      user.deleteRequestedAt = null;
      await user.save();
    }

    // Construct JWT payload dynamically
    let payload = {
      id: user._id,
      role,
      collegeId: user.collegeId,
    };

    // ✅ Include all required student fields in JWT
    if (role === 'student') {
      payload.branch = user.branch;
      payload.year = user.year;
      payload.sem = Number(user.sem);
      payload.name = user.name;
      payload.userId = user.userId;
      payload.roll = user.roll;
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      success: true,
      message: `${role} login successful`,
      token,
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        collegeId: user.collegeId,
        ...(role === 'student' && {
          branch: user.branch,
          year: user.year,
          sem: Number(user.sem),
          roll: user.roll,
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};
