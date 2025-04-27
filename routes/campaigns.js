const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/authMiddleware");

// Afficher la page des campagnes
router.get("/", isAuthenticated, (req, res) => {
  res.render("campaigns/index", { pageTitle: "Liste des Campagnes" });
});

module.exports = router;
