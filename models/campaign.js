const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  date: Date,
  location: String
}, { timestamps: true });

const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = Campaign;
