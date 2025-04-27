const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/authMiddleware");
const Campaign = require("../models/campaign");
const Slot = require("../models/slot"); // 🔥 Importer aussi les slots

// 1️⃣ - Liste des campagnes disponibles
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.render("campaigns/index", { 
      pageTitle: "Liste des Campagnes", 
      campaigns
    });
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de l'affichage des campagnes");
  }
});

// 2️⃣ - Détail d'une campagne + créneaux associés
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    const slots = await Slot.find({ campaign: campaign._id }).sort({ date: 1, startTime: 1 });

    res.render("campaigns/detail", { 
      pageTitle: `Détail de ${campaign.title}`, 
      campaign,
      slots
    });
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de l'affichage des détails de la campagne");
  }
});

module.exports = router;
