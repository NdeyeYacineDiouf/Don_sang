const Donor = require('../models/Donor');

module.exports = {
  checkEligibility: async (req, res, next) => {
    try {
      const donor = await Donor.findOne({ user: req.user._id });
      if (!donor || !donor.isEligible()) {
        return res.status(403).json({
          error: 'Vous n\'êtes pas éligible pour un don à ce moment'
        });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  checkProfileComplete: async (req, res, next) => {
    try {
      const donor = await Donor.findOne({ user: req.user._id });
      if (!donor.bloodGroup) {
        return res.redirect('/profile/complete');
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Erreur serveur' });
    }
  }
};