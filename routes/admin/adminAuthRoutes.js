// routes/admin/adminAuthRoutes.js

const express = require("express");
const router = express.Router();
const adminAuthController = require("../../controllers/admin/adminAuthController");
const isAdmin = require("../../middlewares/isAdmin");
const Campaign = require("../../models/campaign");
const Appointment = require("../../models/Appointment");
const User = require("../../models/user");

// Formulaire de connexion Admin
router.get("/login", adminAuthController.loginForm);

// Traitement de connexion Admin
router.post("/login", adminAuthController.login);

// Dashboard Admin (protégé)
router.get("/dashboard", isAdmin, adminAuthController.dashboard);

// Déconnexion Admin
router.get("/logout", isAdmin, adminAuthController.logout);

// Page de statistiques
router.get("/stats", isAdmin, async (req, res) => {
  try {
    // Récupérer les statistiques
    const totalCampaigns = await Campaign.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    // Campagnes actives (en cours ou à venir)
    const activeCampaigns = await Campaign.countDocuments({
      endDate: { $gte: new Date() }
    });
    
    // Rendez-vous par campagne
    const appointmentsByCampaign = await Appointment.aggregate([
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaign_id',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      {
        $unwind: '$campaign'
      },
      {
        $group: {
          _id: '$campaign._id',
          title: { $first: '$campaign.title' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Rendez-vous par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const appointmentsByMonth = await Appointment.aggregate([
      {
        $match: {
          date_time: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date_time' },
            month: { $month: '$date_time' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.render("admin/stats", {
      pageTitle: "Statistiques",
      layout: "adminLayout",
      stats: {
        totalCampaigns,
        totalUsers,
        totalAppointments,
        activeCampaigns,
        appointmentsByCampaign,
        appointmentsByMonth
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors du chargement des statistiques");
  }
});

module.exports = router;
