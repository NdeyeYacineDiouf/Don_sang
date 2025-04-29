const emailService = require('./emailService');

module.exports = {
    sendCampaignNotification: async (campaign) => {
        try {
            // Implémentation basique - à adapter
            await emailService.sendConfirmationEmail(
                'akouetenathangildasaklikokou@gmail.com', // À remplacer par les destinataires réels
                {
                    date: campaign.startDate.toLocaleDateString('fr-FR'),
                    title: campaign.title,
                    location: campaign.location
                }
            );
            console.log('Notification envoyée pour la campagne:', campaign.title);
        } catch (error) {
            console.error('Erreur notification campagne:', error);
        }
    },

    sendAdminAlert: async (message) => {
        // Implémentation des alertes admin
        console.log('Alerte admin:', message);
    }
};