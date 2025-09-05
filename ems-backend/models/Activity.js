const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['login', 'logout', 'task', 'system', 'update', 'other'],
      default: 'other',
      index: true,
    },
    user: {
      // Can be a user ID reference or a string like 'System'
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: 'System',
    },
    action: { type: String, required: true, trim: true },
    details: { type: String, trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low', index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    metadata: { type: Object },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', ActivitySchema);
