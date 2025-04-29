const express = require('express');
const router = express.Router();
const adminAuthController = require('../../controllers/admin/adminAuthController');
const { authenticateAdmin } = require('../../middlewares/auth');

router.get('/login', adminAuthController.loginForm);
router.post('/login', adminAuthController.login);
router.get('/logout', authenticateAdmin, adminAuthController.logout);

module.exports = router;