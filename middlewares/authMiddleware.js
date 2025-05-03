// middlewares/authMiddleware.js

// Middleware pour protéger les routes
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
      return next(); // ✅ L'utilisateur est connecté, on continue
    }
    // ❌ Sinon, on redirige vers la page de connexion
    res.redirect("/login");
  }
  
  module.exports = isAuthenticated;
  