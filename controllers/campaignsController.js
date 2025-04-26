const Campaign = require('../models/campaign');

// Liste toutes les campagnes
exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find();
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Détails d'une campagne
exports.getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campagne non trouvée' });

        res.json(campaign);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
