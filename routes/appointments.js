const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/authMiddleware");

// Afficher la page des rendez-vous
router.get("/", isAuthenticated, (req, res) => {
  res.render("appointment/index", { pageTitle: "Mes Rendez-vous" });
});

module.exports = router;
