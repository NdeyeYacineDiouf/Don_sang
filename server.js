require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const engine = require('ejs-mate');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');
const cron = require('node-cron');
const sendReminders = require('./scripts/sendReminders');
const expressLayouts = require('express-ejs-layouts');

// Create Express app
const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000  // Timeout après 5s
})
.then(() => console.log('Connecté à MongoDB avec succès'))
.catch(err => {
  console.error('Échec de connexion MongoDB:', err);
  process.exit(1);  // Quitte l'application si la connexion échoue
});

// Tous les jours à 9h
cron.schedule('0 9 * * *', () => {
  console.log('Envoi des rappels...');
  sendReminders().then(() => console.log('Rappels envoyés !'));
});

// Middlewares
app.use(express.json());

app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//middleware gestion de session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

//Flash middleware
app.use(flash());
//middleware pour injection de messages flash dans les vues
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg') || '';
  res.locals.error_msg = req.flash('error_msg') || '';
  res.locals.error = req.flash('error') || '';
  res.locals.user = req.user || null; //pour user injection
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.engine('ejs', engine);
// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/campaigns'));
app.use('/appointments', require('./routes/appointments'));
app.use('/profile', require('./routes/profile'));
app.use('/admin', require('./routes/admin/auth'));
app.use('/admin/campaigns', require('./routes/admin/campaigns'));
app.use('/api', require('./routes/api/appointments'));

// Error handling
app.use(errorHandler.notFound);  // Doit être après toutes les routes
app.use(errorHandler.validationError);  // Gère spécifiquement les erreurs de validation
app.use(errorHandler.serverError);  // Doit être le dernier middleware

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});