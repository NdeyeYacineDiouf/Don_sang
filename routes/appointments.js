// appointments.js (mise à jour des routes)
const express = require("express");
const router = express.Router();
const appointmentsController = require("../controllers/appointmentsController");
const isAuthenticated = require("../middlewares/authMiddleware");
const appointmentController = require("../controllers/appointmentsController");
const methodOverride = require('method-override'); // Assurez-vous d'avoir installé ce package

<<<<<<< HEAD
// Afficher la page des rendez-vous avec la liste des réservations
router.get("/", isAuthenticated, appointmentsController.getUserAppointments);

=======
// Middleware pour gérer les méthodes HTTP comme DELETE
router.use(methodOverride('_method'));

// Page des rendez-vous
router.get("/", isAuthenticated, appointmentController.listAppointments);

// Réservation d'un créneau
router.post("/slots/:slotId/reserve", isAuthenticated, appointmentController.reserveSlot);

// Annulation d'un rendez-vous
router.delete("/:id/cancel", isAuthenticated, appointmentController.cancelAppointment);
router.post("/:id/cancel", isAuthenticated, appointmentController.cancelAppointment); // Ajout d'une route POST pour compatibilité

// Formulaire d'édition et mise à jour d'un rendez-vous
router.get("/:id/edit", isAuthenticated, appointmentController.editForm);
router.post("/:id/edit", isAuthenticated, appointmentController.updateAppointment);

>>>>>>> origin/nathan
module.exports = router;