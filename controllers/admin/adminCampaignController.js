const Campaign = require('../../models/Campaign');
const BloodBank = require('../../models/BloodBank');
const notificationService = require('../../services/notificationService');

module.exports = {
    createCampaignForm: async (req, res) => {
        const bloodBanks = await BloodBank.find();
        res.render('admin/campaigns/new', {
            layout: 'adminLayout',
            bloodBanks
        });
    },

    createCampaign: async (req, res) => {
        try {
            const campaign = new Campaign(req.body);
            await campaign.save();

            await notificationService.sendCampaignNotification(campaign);

            req.flash('success', 'Campagne créée avec succès');
            res.redirect('/admin/campaigns');
        } catch (error) {
            console.error(error);
            res.status(400).render('admin/campaigns/new', {
                layout: 'adminLayout',
                error: error.message
            });
        }
    },

    listCampaigns: async (req, res) => {
        const campaigns = await Campaign.find().sort('-startDate');
        res.render('admin/campaigns/manage', {
            layout: 'adminLayout',
            campaigns
        });
    },

    editCampaignForm: async (req, res) => {
        try {
            const campaign = await Campaign.findById(req.params.id);
            const bloodBanks = await BloodBank.find();

            if (!campaign) {
                req.flash('error', 'Campagne non trouvée');
                return res.redirect('/admin/campaigns');
            }

            res.render('admin/campaigns/edit', {
                layout: 'adminLayout',
                campaign,
                bloodBanks
            });
        } catch (error) {
            console.error(error);
            req.flash('error', 'Erreur lors du chargement du formulaire');
            res.redirect('/admin/campaigns');
        }
    },

    updateCampaign: async (req, res) => {
        try {
            const { id } = req.params;
            const campaign = await Campaign.findByIdAndUpdate(id, req.body, { new: true });

            if (!campaign) {
                req.flash('error', 'Campagne non trouvée');
                return res.redirect('/admin/campaigns');
            }

            req.flash('success', 'Campagne mise à jour avec succès');
            res.redirect('/admin/campaigns');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Erreur lors de la mise à jour');
            res.redirect(`/admin/campaigns/${req.params.id}/edit`);
        }
    },

    deleteCampaign: async (req, res) => {
        try {
            const campaign = await Campaign.findByIdAndDelete(req.params.id);

            if (!campaign) {
                req.flash('error', 'Campagne non trouvée');
                return res.redirect('/admin/campaigns');
            }

            req.flash('success', 'Campagne supprimée avec succès');
            res.redirect('/admin/campaigns');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Erreur lors de la suppression');
            res.redirect('/admin/campaigns');
        }
    }
};