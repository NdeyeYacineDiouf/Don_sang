const Donor = require('../models/Donor');
const Appointment = require('../models/Appointment');

module.exports = {
    getDonorProfile: async (req, res) => {
        try {
            const donor = await Donor.findOne({ user: req.user._id });
            const appointments = await Appointment.find({ donor: donor._id })
                .populate('campaign')
                .sort('-date')
                .limit(5);

            res.render('profile/index', { donor, appointments });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', { message: 'Erreur serveur' });
        }
    },

    updateDonorProfile: async (req, res) => {
        try {
            const { bloodGroup, medicalConditions } = req.body;
            await Donor.findOneAndUpdate(
                { user: req.user._id },
                { bloodGroup, medicalConditions },
                { new: true }
            );

            req.flash('success', 'Profil mis à jour avec succès');
            res.redirect('/profile');
        } catch (error) {
            console.error(error);
            res.status(400).redirect('/profile/edit');
        }
    },

    checkEligibility: async (req, res) => {
        try {
            const donor = await Donor.findOne({ user: req.user._id });
            res.json({ isEligible: donor.isEligible() });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
};