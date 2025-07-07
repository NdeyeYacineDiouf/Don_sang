const express = require("express");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const flash = require('connect-flash');

// Importer les routes
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require('./routes/appointments');
const campaignRoutes = require('./routes/campaigns');
const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
const adminCampaignRoutes = require("./routes/admin/adminCampaignRoutes");

const app = express();

app.use(session({
  secret: 'votre_clé_secrète',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(flash());

// 1. Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/don_sang", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connexion réussie à MongoDB !"))
.catch(err => console.error("❌ Erreur MongoDB :", err));

// 2. Configuration Express + Layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(layouts);
app.set("layout", "layout");

app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    res.locals.layout = "adminLayout";
  } else {
    res.locals.layout = "layout";
  }
  next();
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const methodOverride = require("method-override");
app.use(methodOverride('_method'));

// 3. Sessions
app.use(session({
  secret: "mon_secret_don_sang",
  resave: false,
  saveUninitialized: false
}));

// 4. Variables disponibles dans toutes les vues
app.use(async (req, res, next) => {
  res.locals.isLoggedIn = !!req.session.userId;
  res.locals.notification = req.session.notification || null;
  delete req.session.notification;
  
  // ⭐ MIDDLEWARE USER AJOUTÉ ⭐
  if (req.session && req.session.userId) {
    try {
      const User = require('./models/user');
      const user = await User.findById(req.session.userId);
      res.locals.user = user;
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  
  next();
});

// 5. Définir les routes
app.get("/", async (req, res) => {
  try {
    const Campaign = require('./models/campaign');
    const Appointment = require('./models/Appointment');
    const User = require('./models/user');
    
    // Calculer les statistiques réelles
    const totalUsers = await User.countDocuments();
    const totalDonations = await Appointment.countDocuments();
    
    // Calculer les vies potentiellement sauvées (1 don = 3 vies sauvées en moyenne)
    const livesSaved = totalDonations * 3;
    
    // Compter les centres partenaires (estimation basée sur le nombre de campagnes)
    const totalCampaigns = await Campaign.countDocuments();
    const estimatedCenters = Math.max(Math.floor(totalCampaigns / 3), 5); // Minimum 5 centres
    
    res.render("home", { 
      pageTitle: "Accueil - Don de Sang",
      stats: {
        totalUsers,
        totalDonations,
        livesSaved,
        partnerCenters: estimatedCenters
      }
    });
  } catch (err) {
    console.error("Erreur lors du calcul des statistiques:", err);
    // Valeurs par défaut en cas d'erreur
    res.render("home", { 
      pageTitle: "Accueil - Don de Sang",
      stats: {
        totalUsers: 0,
        totalDonations: 0,
        livesSaved: 0,
        partnerCenters: 5
      }
    });
  }
});
app.get("/about", (req, res) => {
  res.render("about", { pageTitle: "À propos - DonSang+" });
});

// Pages de support
app.get("/aide", (req, res) => {
  res.render("support/aide", { pageTitle: "Aide - DonSang+" });
});

app.get("/contact", (req, res) => {
  res.render("support/contact", { pageTitle: "Contact - DonSang+" });
});

app.get("/faq", (req, res) => {
  res.render("support/faq", { pageTitle: "FAQ - DonSang+" });
});

// Pages légales
app.get("/confidentialite", (req, res) => {
  res.render("legal/confidentialite", { pageTitle: "Politique de Confidentialité - DonSang+" });
});

app.get("/conditions", (req, res) => {
  res.render("legal/conditions", { pageTitle: "Conditions d'Utilisation - DonSang+" });
});

// Routes API
app.use('/api/appointments', appointmentRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use("/admin", adminAuthRoutes);
app.use("/admin", adminCampaignRoutes);

// Routes Auth
app.use("/", authRoutes);

// 6. Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});