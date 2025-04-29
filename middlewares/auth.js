const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

module.exports = {
  authenticateUser: async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.redirect('/login');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId);
      next();
    } catch (error) {
      res.clearCookie('token');
      res.redirect('/login');
    }
  },

  authenticateAdmin: async (req, res, next) => {
    try {
      const token = req.cookies.adminToken;
      if (!token) {
        return res.redirect('/admin/login');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.adminId);
      next();
    } catch (error) {
      res.clearCookie('adminToken');
      res.redirect('/admin/login');
    }
  },

  checkRole: (role) => (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).render('error', {
        message: 'Accès non autorisé'
      });
    }
    next();
  }
};