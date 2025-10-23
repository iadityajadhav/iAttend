const mongoose = require('mongoose');

// Class schema
const ClassSchema = new mongoose.Schema({
      branch: { type: String, required: true },
      year: { type: String, required: true },
      sem: { type: Number, required: true },
      subjects: [{ type: String }]
});

// Admin schema
const AdminSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true },

  userId: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true
  },

  collegeId: { 
    type: String, 
    required: true, 
    unique: true
  },

  password: { 
    type: String, 
    required: true
  },

  classes: { 
    type: [ClassSchema], 
    default: [] 
  },

  deleteRequestedAt: { 
    type: Date, 
    default: null 
  },
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);