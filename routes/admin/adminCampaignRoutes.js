const express = require("express");
const router = express.Router();
const isAdmin = require("../../middlewares/isAdmin");
const Campaign = require("../../models/campaign");
const Slot = require("../../models/slot"); // Ajouter cette ligne
const { createSlotsForCampaign } = require("../../utils/slotGenerator"); // Importer l'utilitaire

// ➡️ Afficher le formulaire de création de campagne
router.get("/campaigns/new", isAdmin, (req, res) => {
  res.render("admin/campaigns/new", { 
    pageTitle: "Nouvelle Campagne", 
    layout: "adminLayout" 
  });
});

// ➡️ Enregistrer une nouvelle campagne
router.post("/campaigns", isAdmin, async (req, res) => {
  try {
    const { 
      title, description, startDate, endDate, 
      startTime, endTime, location, maxPeoplePerSlot,
      generateSlots, slotDuration
    } = req.body;
    
    const newCampaign = new Campaign({
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      maxPeoplePerSlot: parseInt(maxPeoplePerSlot),
      slots: [] // Initialiser avec un tableau vide
    });

    // Sauvegarder la campagne
    const savedCampaign = await newCampaign.save();

    // Si la génération automatique est demandée
    if (generateSlots === "true") {
      await createSlotsForCampaign(
        savedCampaign,
        Slot,
        parseInt(slotDuration || 60)
      );
    }

    req.session.notification = "✅ Campagne créée avec succès";
    res.redirect("/admin/campaigns/manage"); // Redirige vers la liste
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de la création de la campagne: " + err.message);
  }
});

// ➡️ Afficher le formulaire de modification d'une campagne
router.get("/campaigns/:id/edit", isAdmin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.send("Campagne introuvable");
    }
    res.render("admin/campaigns/edit", { 
      pageTitle: "Modifier la Campagne", 
      campaign,
      layout: "adminLayout" 
    });
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de l'affichage du formulaire de modification");
  }
});

// ➡️ Soumettre les modifications d'une campagne
router.post("/campaigns/:id", isAdmin, async (req, res) => {
  try {
    const { title, description, startDate, endDate, startTime, endTime, location, maxPeoplePerSlot } = req.body;
    
    await Campaign.findByIdAndUpdate(req.params.id, {
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      maxPeoplePerSlot: parseInt(maxPeoplePerSlot)
    });

    req.session.notification = "✅ Campagne mise à jour avec succès";
    res.redirect("/admin/campaigns/manage");
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de la mise à jour de la campagne");
  }
});

// ➡️ Page pour gérer (modifier/supprimer) toutes les campagnes
router.get("/campaigns/manage", isAdmin, async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    const notification = req.session.notification;
    req.session.notification = null; // Effacer la notification après l'affichage
    
    res.render("admin/campaigns/manage", { 
      pageTitle: "Gérer les Campagnes", 
      campaigns,
      notification,
      layout: "adminLayout"
    });
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de l'affichage des campagnes");
  }
});

// ➡️ Supprimer une campagne
router.delete("/campaigns/:id", isAdmin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).send("Campagne non trouvée");
    }

    // Supprimer d'abord tous les créneaux associés
    await Slot.deleteMany({ campaign: campaign._id });
    
    // Puis supprimer la campagne
    await Campaign.findByIdAndDelete(req.params.id);
    
    req.session.notification = "✅ Campagne supprimée avec succès";
    res.redirect("/admin/campaigns/manage");
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de la suppression");
  }
});

// ➡️ NOUVELLE ROUTE : Générer des créneaux pour une campagne existante
router.post("/campaigns/:id/generate-slots", isAdmin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).send("Campagne non trouvée");
    }

    const { slotDuration } = req.body;
    const duration = parseInt(slotDuration || 60);

    // Supprimer les créneaux existants (optionnel, à adapter selon votre logique)
    await Slot.deleteMany({ campaign: campaign._id });
    campaign.slots = [];
    
    // Générer de nouveaux créneaux
    const createdSlots = await createSlotsForCampaign(campaign, Slot, duration);
    
    req.session.notification = `✅ ${createdSlots.length} créneaux ont été générés avec succès`;
    res.redirect(`/admin/campaigns/${campaign._id}/edit`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la génération des créneaux: " + err.message);
  }
});

// ➡️ NOUVELLE ROUTE : Afficher les créneaux d'une campagne
router.get("/campaigns/:id/slots", isAdmin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).send("Campagne non trouvée");
    }

    const slots = await Slot.find({ campaign: campaign._id }).sort({ day: 1, startTime: 1 });
    
    res.render("admin/campaigns/slots", {
      pageTitle: `Créneaux de ${campaign.title}`,
      campaign,
      slots,
      layout: "adminLayout"
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'affichage des créneaux");
  }
});

module.exports = router;