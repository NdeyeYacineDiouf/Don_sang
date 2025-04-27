const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/authMiddleware");
const Campaign = require("../models/campaign"); // 🔥 N'oublie pas d'importer le modèle !

// Afficher la page des campagnes avec les données
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const campaigns = await Campaign.find(); // 🔥 Aller chercher les campagnes dans MongoDB
    res.render("campaigns/index", { 
      pageTitle: "Liste des Campagnes", 
      campaigns // 🔥 Envoyer les campagnes à la vue
    });
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de l'affichage des campagnes");
  }
});

module.exports = router;
