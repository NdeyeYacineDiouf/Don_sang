const express = require("express");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

// Importer les routes
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require('./routes/appointments');
const campaignRoutes = require('./routes/campaigns');
const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
const adminCampaignRoutes = require("./routes/admin/adminCampaignRoutes");

const app = express();

// 1. Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/don_sang", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connexion réussie à MongoDB !"))
.catch(err => console.error("❌ Erreur MongoDB :", err));

// 2. Configuration Express + Layouts
app.set("view engine", "ejs"); // Utiliser EJS
app.set("views", path.join(__dirname, "views")); // Dossier views
app.use(layouts); // Activer express-ejs-layouts
app.set("layout", "layout"); // Utiliser views/layout.ejs par défaut

app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    res.locals.layout = "adminLayout"; // Layout spécial pour admin
  } else {
    res.locals.layout = "layout"; // Layout normal pour clients
  }
  next();
});

// Middlewares
app.use(express.urlencoded({ extended: true })); // Lire les formulaires
app.use(express.static(path.join(__dirname, "public"))); // Fichiers statiques (images, css, js)

const methodOverride = require("method-override");
app.use(methodOverride('_method'));


// 3. Sessions
app.use(session({
  secret: "mon_secret_don_sang",
  resave: false,
  saveUninitialized: false
}));

// 4. Variables disponibles dans toutes les vues
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.userId; // connecté ou pas
  res.locals.notification = req.session.notification || null; // messages
  delete req.session.notification; // effacer après affichage
  next();
});

// 5. Définir les routes
app.get("/", (req, res) => {
  res.render("home", { pageTitle: "Accueil - Don de Sang" });
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
