const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middlewares/auth');
const profileController = require('../controllers/profileController');

router.get('/', authenticateUser, profileController.showProfile);
router.get('/complete', authenticateUser, profileController.completeProfile);
router.put('/', authenticateUser, profileController.updateProfile);

module.exports = router;