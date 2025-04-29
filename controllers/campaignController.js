const Campaign = require('../models/Campaign');
const BloodBank = require('../models/BloodBank');
const { getEligibleDonors } = require('../services/donorService');

module.exports = {
    listCampaigns: async (req, res) => {
        try {
            const campaigns = await Campaign.find({ status: 'active' })
                .sort('-startDate')
                .populate('bloodBank');

            res.render('campaigns/index', { 
                campaigns,
                pageTitle: 'Campagnes de Don de Sang'
            });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', { message: 'Erreur serveur' });
        }
    },

    showCampaign: async (req, res) => {
        try {
            const campaign = await Campaign.findById(req.params.id)
                .populate('bloodBank')
                .populate('timeSlots');

            if (!campaign) {
                return res.status(404).render('error', { message: 'Campagne non trouvée' });
            }

            // Check donor eligibility
            let isEligible = false;
            if (req.user) {
                const donor = await Donor.findOne({ user: req.user._id });
                isEligible = donor ? donor.isEligible() : false;
            }

            res.render('campaigns/detail', {
                campaign,
                isEligible,
                mapApiKey: process.env.GOOGLE_MAPS_API_KEY
            });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', { message: 'Erreur serveur' });
        }
    }
};