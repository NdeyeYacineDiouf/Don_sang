const express = require('express');
const router = express.Router();
const Campaign = require('../../models/Campaign');
const { authenticateUser } = require('../../middlewares/auth');

router.get('/', async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'active' })
            .populate('bloodBank')
            .sort('-startDate');
        res.json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.get('/nearby', authenticateUser, async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;
        const campaigns = await Campaign.find({
            'bloodBank.location.coordinates': {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000
                }
            },
            status: 'active'
        }).populate('bloodBank');

        res.json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;