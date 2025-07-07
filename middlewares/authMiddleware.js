const User = require("../models/user"); // Assure-toi que le modèle User est importé

// Middleware pour protéger les routes
async function isAuthenticated(req, res, next) {
  // Vérifie si l'utilisateur est connecté via la session
  if (req.session && req.session.userId) {
    try {
      // Récupère l'utilisateur à partir de l'ID de la session
      const user = await User.findById(req.session.userId);

      // Si l'utilisateur n'est pas trouvé, rediriger vers la page de connexion
      if (!user) {
        return res.redirect("/login");
      }

      // Attacher l'utilisateur à la requête pour un accès facile dans les contrôleurs
      req.user = user;
      return next(); // L'utilisateur est authentifié, on passe à la suite
    } catch (err) {
      console.error(err);
      return res.status(500).send("Erreur d'authentification");
    }
  }
  
  // Si l'utilisateur n'est pas connecté, redirige vers la page de connexion
  res.redirect("/login");
}

module.exports = isAuthenticated;
