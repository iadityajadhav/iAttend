const { required } = require('joi');
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
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

  branch: {
    type: String,
    required: true,
    trim: true,
  },

  year: {
    type: String,
    required: true,
    trim: true,
  },

  sem: {
    type: Number,
    required: true,
    trim: true,
  },

  roll: {
    type: Number,
    required: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  subjects: [
    {
      type: String
    },
  ],
  
  deleteRequestedAt: { 
    type: Date, 
    default: null 
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Student', StudentSchema);
