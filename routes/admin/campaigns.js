const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../../middlewares/auth');
const adminCampaignController = require('../../controllers/admin/adminCampaignController');

router.get('/', authenticateAdmin, adminCampaignController.listCampaigns);
router.get('/new', authenticateAdmin, adminCampaignController.createCampaignForm);
router.post('/', authenticateAdmin, adminCampaignController.createCampaign);
router.get('/:id/edit', authenticateAdmin, adminCampaignController.editCampaignForm);
router.put('/:id', authenticateAdmin, adminCampaignController.updateCampaign);
router.delete('/:id', authenticateAdmin, adminCampaignController.deleteCampaign);

module.exports = router;