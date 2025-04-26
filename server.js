// server.js

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/authRoutes");

const app = express();

// 1. Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/don_sang", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connexion réussie à MongoDB !"))
.catch(err => console.error("❌ Erreur MongoDB :", err));

// 2. Configuration d'Express
app.set("view engine", "ejs"); // EJS comme moteur de templates
app.set("views", path.join(__dirname, "views")); // Dossier des vues

app.use(express.urlencoded({ extended: true })); // Pour lire les données de formulaire
app.use(express.static(path.join(__dirname, "public"))); // Fichiers statiques (CSS, images, JS)

// 3. Configuration des sessions
app.use(session({
  secret: "mon_secret_don_sang",
  resave: false,
  saveUninitialized: false
}));
// Ajout d'une variable globale pour savoir si connecté
app.use((req, res, next) => {
    res.locals.isLoggedIn = !!req.session.userId; // true si connecté, false sinon
    next();
  });

 // Middleware pour envoyer la notification aux vues et la supprimer après affichage
app.use((req, res, next) => {
  res.locals.notification = req.session.notification || null;
  delete req.session.notification;
  next();
});

// 4. Routes
app.get("/", (req, res) => {
  res.render("home"); // Vue Accueil
});

app.use("/", authRoutes); // Routes d'authentification (login, signup, logout)

// 5. Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
