// appointment.js (mise à jour du modèle)
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    campaign_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    slot_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slots',
        required: true
    },
    center_id: {
        type: String, // ou ObjectId si tu gères les centres aussi
        required: true
    },
    date_time: {
        type: Date,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);