const express = require("express");
const router = express.Router();
const isAdmin = require("../../middlewares/isAdmin");
const Campaign = require("../../models/campaign");

// Afficher le formulaire de création
router.get("/campaigns/new", isAdmin, (req, res) => {
  res.render("admin/campaigns/new", { 
    pageTitle: "Nouvelle Campagne", 
    layout: "adminLayout" 
  });
});

// Enregistrer une nouvelle campagne
router.post("/campaigns", isAdmin, async (req, res) => {
  try {
    const { title, description, startDate, endDate, startTime, endTime, location } = req.body;
    
    const newCampaign = new Campaign({
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location
    });

    await newCampaign.save();
    res.redirect("/admin/dashboard"); // ou la liste des campagnes
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de la création de la campagne");
  }
});

// Formulaire de modification d'une campagne
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

// Soumettre les modifications
router.post("/campaigns/:id", isAdmin, async (req, res) => {
  try {
    const { title, description, startDate, endDate, startTime, endTime, location } = req.body;
    
    await Campaign.findByIdAndUpdate(req.params.id, {
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location
    });

    res.redirect("/admin/dashboard"); // ou vers la liste des campagnes admin
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de la mise à jour de la campagne");
  }
});

// Page pour gérer (modifier/supprimer) les campagnes
router.get("/campaigns/manage", isAdmin, async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.render("admin/campaigns/manage", { 
      pageTitle: "Gérer les Campagnes", 
      campaigns,
      layout: "adminLayout"
    });
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de l'affichage des campagnes");
  }
});

// Supprimer une campagne
router.delete("/campaigns/:id", isAdmin, async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    req.session.notification = "Campagne supprimée avec succès ✅";
    res.redirect("/admin/campaigns/manage");
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de la suppression");
  }
});

module.exports = router;
