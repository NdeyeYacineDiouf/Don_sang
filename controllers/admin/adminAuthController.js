const adminEmail = "admin@donsang.com";
const adminPassword = "admin1234";

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

exports.dashboard = (req, res) => {
  res.render("admin/dashboard", { 
    pageTitle: "Dashboard Admin",
    layout: "adminLayout"
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};
