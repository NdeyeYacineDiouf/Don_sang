const bcrypt = require('bcrypt');
const User = require('../models/User');
const Donor = require('../models/Donor');
const { generateToken } = require('../utils/auth');

module.exports = {
  showSignupForm: (req, res) => {
    res.render('auth/signup');
  },

  signup: async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        password: hashedPassword,
        role: 'user'
      });
      await user.save();

      // Create donor profile
      const donor = new Donor({
        user: user._id,
        firstName,
        lastName
      });
      await donor.save();

      // Generate token
      const token = generateToken(user);
      res.cookie('token', token, { httpOnly: true });

      res.redirect('/profile/complete');
    } catch (error) {
      console.error(error);
      res.status(400).render('auth/signup', {
        error: 'Erreur lors de la création du compte'
      });
    }
  },

  showLoginForm: (req, res) => {
    res.render('auth/login');
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        req.flash('error', 'Identifiants incorrects');
        return res.redirect('/login');
      }

      const token = generateToken(user);
      res.cookie('token', token, { httpOnly: true });

      const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/';
      res.redirect(redirectTo);
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Erreur serveur' });
    }
  },

  logout: (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
  }
};