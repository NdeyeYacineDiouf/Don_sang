const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../../middlewares/auth');
const adminStatsController = require('../../controllers/admin/adminStatsController');

router.get('/', authenticateAdmin, adminStatsController.getStats);
router.get('/trends', authenticateAdmin, adminStatsController.getDonationTrends);

module.exports = router;