const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  day: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  maxPeople: { 
    type: Number, 
    required: true
  },
  reserved: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Index pour accélérer les recherches
slotSchema.index({ campaign: 1, day: 1, startTime: 1 });

const Slot = mongoose.model("Slot", slotSchema);

module.exports = Slot;