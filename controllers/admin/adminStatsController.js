const Campaign = require('../../models/Campaign');
const Appointment = require('../../models/Appointment');
const Donor = require('../../models/Donor');

module.exports = {
    getStats: async (req, res) => {
        try {
            const [campaigns, appointments, donors] = await Promise.all([
                Campaign.aggregate([
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ]),
                Appointment.aggregate([
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ]),
                Donor.aggregate([
                    { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
                ])
            ]);

            res.render('admin/stats', {
                layout: 'adminLayout',
                campaigns,
                appointments,
                donors
            });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', { message: 'Erreur serveur' });
        }
    },

    getDonationTrends: async (req, res) => {
        try {
            const trends = await Appointment.aggregate([
                {
                    $match: {
                        status: 'completed',
                        createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            res.json(trends);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
};