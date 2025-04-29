const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  bloodBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodBank',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  eligibilityCriteria: [String],
  timeSlots: [{
    date: Date,
    startTime: String,
    endTime: String,
    maxDonors: Number,
    availableSlots: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  targetDonations: Number,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

// Validation
campaignSchema.pre('save', function (next) {
  if (this.endDate < this.startDate) {
    throw new Error('End date must be after start date');
  }
  next();
});

// Indexes
campaignSchema.index({ bloodBank: 1 });
campaignSchema.index({ startDate: 1 });
campaignSchema.index({ status: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);