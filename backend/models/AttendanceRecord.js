const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: false },

  // Store student info snapshot (so if name or year changes, record still accurate)
  collegeId: { type: String, required: true },
  name: { type: String, required: true },
  userId: { type: String, required: true },
  roll: { type: Number, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  sem: { type: Number, required: true },

  subject: { type: String, required: true },
  lectureNumber: { type: Number, required: true },

  attendedAt: { type: Date, default: Date.now },
  date: { type: String, required: true }, // e.g. '2025-10-22'
});

AttendanceRecordSchema.index(
  { studentId: 1, date: 1, lectureNumber: 1, subject: 1 },
  { unique: true, message: 'Attendance already marked for this lecture' }
);

module.exports = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
