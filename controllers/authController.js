const User = require("../models/user");

// Afficher formulaire inscription
exports.signupForm = (req, res) => {
  res.render("signup");
};

/// Afficher le formulaire d'inscription
exports.signupForm = (req, res) => {
  res.render("auth/signup", { pageTitle: "Inscription - Don de Sang" });
};

// Inscrire un utilisateur
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    req.session.userId = user._id;

    // 💬 Ajouter un message de notification
    req.session.notification = "Inscription réussie !";

    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.redirect("/signup");
  }
};


// Afficher le formulaire de connexion
exports.loginForm = (req, res) => {
  res.render("auth/login", { pageTitle: "Connexion - Don de Sang" });
};

// Connecter l'utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.redirect("/login");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.redirect("/login");
    }
    req.session.userId = user._id;
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect("/login");
  }
};

// Déconnexion
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");  // ← Changer "/login" en "/"
  });
};

