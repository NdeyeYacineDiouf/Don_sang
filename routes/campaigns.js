const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/authMiddleware");
const Campaign = require("../models/campaign");
const Slot = require("../models/slot");

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
    const slots = await Slot.find({ campaign: campaign._id }).sort({ day: 1, startTime: 1 });

    // Vérifier si l'utilisateur est admin (à adapter selon votre logique d'authentification)
    const isAdmin = req.user && req.user.role === 'admin';

    res.render("campaigns/detail", { 
      pageTitle: `Détail de ${campaign.title}`, 
      campaign,
      slots,
      isAdmin
    });
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de l'affichage des détails de la campagne");
  }
});

// 3️⃣ - Ajouter un créneau à une campagne
router.post("/:id/slots", isAuthenticated, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Accès non autorisé");
    }

    const { day, startTime, endTime, maxPeople } = req.body;
    const campaignId = req.params.id;

    // Récupérer la campagne pour vérifier les paramètres
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).send("Campagne non trouvée");
    }

    // Créer un nouveau créneau
    const slot = new Slot({
      campaign: campaignId,
      day: new Date(day),
      startTime,
      endTime,
      maxPeople: maxPeople || campaign.maxPeoplePerSlot
    });

    await slot.save();

    // Mettre à jour la référence dans la campagne
    campaign.slots.push(slot._id);
    await campaign.save();

    res.redirect(`/campaigns/${campaignId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'ajout du créneau");
  }
});

// 4️⃣ - Réserver un créneau (nouvelle route)
router.post("/:campaignId/slots/:slotId/reserve", isAuthenticated, async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.slotId);
    if (!slot) {
      return res.status(404).send("Créneau non trouvé");
    }

    // Vérifier s'il reste des places
    if (slot.reserved >= slot.maxPeople) {
      return res.status(400).send("Ce créneau est complet");
    }

    // Incrémenter le nombre de réservations
    slot.reserved += 1;
    await slot.save();

    // Rediriger vers la page de la campagne
    res.redirect(`/campaigns/${req.params.campaignId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la réservation");
  }
});


module.exports = router;