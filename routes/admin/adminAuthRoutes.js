// routes/admin/adminAuthRoutes.js

const express = require("express");
const router = express.Router();
const adminAuthController = require("../../controllers/admin/adminAuthController");
const isAdmin = require("../../middlewares/isAdmin");

// Formulaire de connexion Admin
router.get("/login", adminAuthController.loginForm);

// Traitement de connexion Admin
router.post("/login", adminAuthController.login);

// Dashboard Admin (protégé)
router.get("/dashboard", isAdmin, adminAuthController.dashboard);

// Déconnexion Admin
router.get("/logout", isAdmin, adminAuthController.logout);

module.exports = router;
