const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

router.get('/', campaignController.listCampaigns);
router.get('/:id', campaignController.showCampaign);

module.exports = router;