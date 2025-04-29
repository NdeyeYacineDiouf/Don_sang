const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true
    },
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor',
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled'
    },
    cancellationReason: String,
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String
    }
}, { timestamps: true });

// Indexes
appointmentSchema.index({ donor: 1 });
appointmentSchema.index({ campaign: 1 });
appointmentSchema.index({ slot: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);