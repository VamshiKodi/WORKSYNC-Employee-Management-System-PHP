const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['annual', 'sick', 'unpaid', 'casual', 'other'],
    default: 'annual',
    index: true
  },
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date, required: true, index: true },
  days: { type: Number, required: true, min: 0 },
  reason: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approvedAt: { type: Date },
  comments: { type: String, trim: true }
}, { timestamps: true });

LeaveRequestSchema.index({ employeeId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
