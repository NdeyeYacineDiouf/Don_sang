const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/authMiddleware");
const appointmentController = require("../controllers/appointmentsController");

// Page des rendez-vous
router.get("/", isAuthenticated, appointmentController.listAppointments);

// Réservation d'un créneau
router.post("/slots/:slotId/reserve", isAuthenticated, appointmentController.reserveSlot);

//Annulation et modification d’un rendez-vous
router.delete("/:id/cancel", isAuthenticated, appointmentController.cancelAppointment);
router.get("/:id/edit", isAuthenticated, appointmentController.editForm);
router.post("/:id/edit", isAuthenticated, appointmentController.updateAppointment);
module.exports = router;
