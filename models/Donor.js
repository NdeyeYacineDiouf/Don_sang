const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    dateOfBirth: Date,
    contact: {
        phone: String,
        emergencyContact: {
            name: String,
            phone: String,
            relationship: String
        }
    },
    address: {
        street: String,
        city: String,
        postalCode: String
    },
    medicalHistory: [{
        date: Date,
        description: String,
        isEligible: Boolean
    }],
    donationsCount: {
        type: Number,
        default: 0
    },
    lastDonationDate: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Methods
donorSchema.methods.isEligible = function () {
    // Check last donation date (minimum 8 weeks between donations)
    if (this.lastDonationDate) {
        const weeksSinceLastDonation =
            (new Date() - this.lastDonationDate) / (1000 * 60 * 60 * 24 * 7);
        if (weeksSinceLastDonation < 8) return false;
    }

    // Check medical history
    const recentIssues = this.medicalHistory.filter(entry =>
        !entry.isEligible &&
        (new Date() - entry.date) < (1000 * 60 * 60 * 24 * 30) // Last 30 days
    );

    return recentIssues.length === 0;
};

// Indexes
donorSchema.index({ user: 1 });
donorSchema.index({ bloodGroup: 1 });
donorSchema.index({ lastDonationDate: 1 });

module.exports = mongoose.model('Donor', donorSchema);