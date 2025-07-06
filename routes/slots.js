// slots.js (routes)
const express = require("express");
const router = express.Router();
const slotsController = require("../controllers/slotsController");
const isAuthenticated = require("../middlewares/authMiddleware");

// Route pour réserver un créneau
router.post('/:slotId/reserve', isAuthenticated, slotsController.reserveSlot);

module.exports = router;