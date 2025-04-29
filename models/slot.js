const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  maxDonors: {
    type: Number,
    required: true,
    min: 1
  },
  availableSlots: {
    type: Number,
    default: function () { return this.maxDonors; }
  }
}, { timestamps: true });

// Indexes
slotSchema.index({ campaign: 1 });
slotSchema.index({ date: 1 });

// Methods
slotSchema.methods.isAvailable = function () {
  return this.availableSlots > 0;
};

// Static methods
slotSchema.statics.findAvailable = function (campaignId) {
  return this.find({
    campaign: campaignId,
    date: { $gte: new Date() },
    availableSlots: { $gt: 0 }
  }).sort('date startTime');
};

module.exports = mongoose.model('Slot', slotSchema);