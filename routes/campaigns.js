const express = require('express');
const router = express.Router();
const campaignsController = require('../controllers/campaignsController');

// Routes publiques
router.get('/', campaignsController.getAllCampaigns);
router.get('/:id', campaignsController.getCampaignById);

module.exports = router;
