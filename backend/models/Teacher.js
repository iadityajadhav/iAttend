const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },

  userId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  collegeId: {
    type: String,
    required: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  classes: [
    {
        branch : String,
        year : String,
        sem : Number,
        subject : String,
    },
  ],
  
  deleteRequestedAt: { 
    type: Date, 
    default: null 
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Teacher', TeacherSchema);