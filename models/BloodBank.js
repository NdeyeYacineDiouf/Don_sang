const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        address: String,
        city: String,
        postalCode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    contact: {
        phone: String,
        email: String
    },
    operatingHours: [{
        day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        open: String,
        close: String
    }],
    bloodInventory: [{
        bloodType: String,
        quantity: Number,
        minimumRequired: Number
    }]
}, { timestamps: true });

// Geolocation index
bloodBankSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('BloodBank', bloodBankSchema);