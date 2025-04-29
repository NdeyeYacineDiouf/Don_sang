const bcrypt = require('bcrypt');
const Admin = require('../../models/Admin');
const { generateToken } = require('../../utils/auth');

module.exports = {
  loginForm: (req, res) => {
    res.render('admin/login', { layout: 'adminLayout' });
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email });

      if (!admin || !(await bcrypt.compare(password, admin.password))) {
        req.flash('error', 'Identifiants incorrects');
        return res.redirect('/admin/login');
      }

      const token = generateToken(admin, 'admin');
      res.cookie('adminToken', token, { httpOnly: true });
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Erreur serveur' });
    }
  },

  dashboard: async (req, res) => {
    try {
      const stats = {
        activeCampaigns: await Campaign.countDocuments({ status: 'active' }),
        upcomingAppointments: await Appointment.countDocuments({
          status: 'scheduled',
          date: { $gte: new Date() }
        })
      };
      res.render('admin/dashboard', { layout: 'adminLayout', stats });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Erreur serveur' });
    }
  },

  logout: (req, res) => {
    res.clearCookie('adminToken');
    res.redirect('/admin/login');
  }
};