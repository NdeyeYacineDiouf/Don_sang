const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
  locationDetails: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    place_id: String
  },
  maxPeoplePerSlot: { type: Number, required: true }, // Nombre max de personnes par créneau

  // Ajouter un champ pour relier les créneaux (slots) à la campagne
  slots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot' // Référence au modèle Slot
  }]
}, { timestamps: true });

const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = Campaign;
