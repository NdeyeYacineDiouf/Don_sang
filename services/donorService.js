// services/donorService.js
const Donor = require('../models/Donor');

module.exports = {
    getEligibleDonors: async (bloodGroup) => {
        try {
            const eligibleDonors = await Donor.find({
                bloodGroup,
                lastDonationDate: {
                    $lt: new Date(new Date() - 8 * 7 * 24 * 60 * 60 * 1000) // 8 semaines
                },
                'medicalHistory.isEligible': true
            }).populate('user');

            return eligibleDonors;
        } catch (error) {
            console.error('Error fetching eligible donors:', error);
            throw error;
        }
    },

    checkDonorEligibility: async (donorId) => {
        const donor = await Donor.findById(donorId);
        return donor.isEligible();
    }
};