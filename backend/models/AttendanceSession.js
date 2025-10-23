const mongoose = require('mongoose');

const AttendanceSessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  collegeId: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  sem: { type: Number, required: true },
  subject: { type: String, required: true },
  lectureNumber: { type: Number, required: true }, // e.g. 1, 2, 3 (1st, 2nd lecture)
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AttendanceSession', AttendanceSessionSchema);
