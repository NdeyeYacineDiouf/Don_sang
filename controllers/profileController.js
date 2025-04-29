const Donor = require('../models/Donor');
const Appointment = require('../models/Appointment');

module.exports = {
    showProfile: async (req, res) => {
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

    updateProfile: async (req, res) => {
        try {
            const { bloodGroup, medicalConditions } = req.body;
            const donor = await Donor.findOneAndUpdate(
                { user: req.user._id },
                { bloodGroup, medicalConditions },
                { new: true }
            );

            req.flash('success', 'Profil mis à jour avec succès');
            res.redirect('/profile');
        } catch (error) {
            console.error(error);
            res.status(400).redirect('/profile');
        }
    },

    completeProfile: (req, res) => {
        res.render('profile/complete');
    }
};