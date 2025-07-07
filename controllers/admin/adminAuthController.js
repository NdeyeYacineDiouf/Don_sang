const adminEmail = "admin@donsang.com";
const adminPassword = "admin1234";
const Campaign = require("../../models/campaign");
const Appointment = require("../../models/Appointment");
const User = require("../../models/user");

exports.loginForm = (req, res) => {
  res.render("admin/login", { 
    pageTitle: "Connexion Administrateur",
    layout: false 
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (email === adminEmail && password === adminPassword) {
    req.session.isAdmin = true;
    res.redirect("/admin/dashboard");
  } else {
    res.redirect("/admin/login");
  }
};

exports.dashboard = async (req, res) => {
  try {
    // Récupérer les statistiques réelles
    const totalCampaigns = await Campaign.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    // Campagnes actives (en cours ou à venir)
    const activeCampaigns = await Campaign.countDocuments({
      endDate: { $gte: new Date() }
    });
    
    // Rendez-vous ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const appointmentsThisMonth = await Appointment.countDocuments({
      date_time: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    
    // Calculer le taux de présence (approximation)
    const completedAppointments = await Appointment.countDocuments({
      date_time: { $lt: new Date() }
    });
    const attendanceRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 95;
    
    res.render("admin/dashboard", { 
      pageTitle: "Dashboard Admin",
      layout: "adminLayout",
      stats: {
        totalCampaigns,
        totalUsers,
        totalAppointments,
        activeCampaigns,
        appointmentsThisMonth,
        attendanceRate
      }
    });
  } catch (err) {
    console.error("Erreur lors du chargement des statistiques du dashboard:", err);
    res.render("admin/dashboard", { 
      pageTitle: "Dashboard Admin",
      layout: "adminLayout",
      stats: {
        totalCampaigns: 0,
        totalUsers: 0,
        totalAppointments: 0,
        activeCampaigns: 0,
        appointmentsThisMonth: 0,
        attendanceRate: 95
      }
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};
