const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: () => `EMP${Date.now()}`
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  hireDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  salary: {
    type: Number,
    required: true,
    default: 0
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  skills: [{
    type: String,
    trim: true
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number,
    field: String
  }],
  workExperience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'on_leave'],
    default: 'active'
  },
  profilePicture: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for search
employeeSchema.index({ firstName: 'text', lastName: 'text', email: 'text', department: 'text' });

// Ensure virtual fields are serialized
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema); 