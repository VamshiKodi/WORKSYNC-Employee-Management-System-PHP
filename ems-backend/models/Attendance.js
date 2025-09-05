const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  clockIn: {
    time: {
      type: Date
    },
    location: {
      type: String
    },
    ipAddress: {
      type: String
    }
  },
  clockOut: {
    time: {
      type: Date
    },
    location: {
      type: String
    },
    ipAddress: {
      type: String
    }
  },
  breaks: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number // in minutes
    },
    type: {
      type: String,
      enum: ['lunch', 'coffee', 'other'],
      default: 'other'
    }
  }],
  totalWorkHours: {
    type: Number, // in hours
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day', 'on_leave'],
    default: 'present'
  },
  notes: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
attendanceSchema.index({ employeeId: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ employeeId: 1, 'date': { $gte: new Date() } });

// Virtual for work duration
attendanceSchema.virtual('workDuration').get(function() {
  if (!this.clockIn.time || !this.clockOut.time) {
    return 0;
  }
  
  const duration = this.clockOut.time - this.clockIn.time;
  const breakDuration = this.breaks.reduce((total, breakItem) => {
    if (breakItem.endTime) {
      return total + (breakItem.endTime - breakItem.startTime);
    }
    return total;
  }, 0);
  
  return (duration - breakDuration) / (1000 * 60 * 60); // Convert to hours
});

// Method to calculate total work hours
attendanceSchema.methods.calculateWorkHours = function() {
  if (!this.clockIn.time || !this.clockOut.time) {
    return 0;
  }
  
  const duration = this.clockOut.time - this.clockIn.time;
  const breakDuration = this.breaks.reduce((total, breakItem) => {
    if (breakItem.endTime) {
      return total + (breakItem.endTime - breakItem.startTime);
    }
    return total;
  }, 0);
  
  this.totalWorkHours = (duration - breakDuration) / (1000 * 60 * 60);
  return this.totalWorkHours;
};

// Pre-save middleware to calculate work hours
attendanceSchema.pre('save', function(next) {
  if (this.clockIn.time && this.clockOut.time) {
    this.calculateWorkHours();
  }
  next();
});

// Ensure virtual fields are serialized
attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Attendance', attendanceSchema); 