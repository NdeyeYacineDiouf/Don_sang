const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');
const authMiddleware = require('../middlewares/authMiddleware'); // si tu as de l'authentification

// Route pour inscrire un utilisateur à une campagne
router.post('/', authMiddleware, appointmentsController.createAppointment);

module.exports = router;
