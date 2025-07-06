// appointments.js (mise à jour des routes)
const express = require("express");
const router = express.Router();
const appointmentsController = require("../controllers/appointmentsController");
const isAuthenticated = require("../middlewares/authMiddleware");

// Afficher la page des rendez-vous avec la liste des réservations
router.get("/", isAuthenticated, appointmentsController.getUserAppointments);

module.exports = router;