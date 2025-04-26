const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Formulaire inscription
router.get("/signup", authController.signupForm);

// Envoi formulaire inscription
router.post("/signup", authController.signup);

// Formulaire connexion
router.get("/login", authController.loginForm);

// Envoi formulaire connexion
router.post("/login", authController.login);

// Déconnexion
router.get("/logout", authController.logout);

module.exports = router;
