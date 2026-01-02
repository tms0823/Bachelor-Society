const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const path = require('path');

// Initialize app
const app = express();

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Database connection
const db = require('./config/db');

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Load passport configuration
require('./config/passport');

// Import middleware
const { requireAuth } = require('./middlewares/authMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const housingRoutes = require('./routes/housingRoutes');
const roommateRoutes = require('./routes/roommateRoutes');
const buddyRoutes = require('./routes/buddyRoutes');
const messageRoutes = require('./routes/messageRoutes');

// API routes (no auth middleware - handled in controllers)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/housing', housingRoutes);
app.use('/api/roommates', roommateRoutes);
app.use('/api/buddies', buddyRoutes);
app.use('/api/messages', messageRoutes);

// Protected routes - require authentication
// Housing frontend pages
app.get('/housing', requireAuth, (req, res) => {
  console.log('Housing route - req.user:', req.user);
  res.render('housingList', { user: req.user || { id: 1, username: 'test' } });
});
app.get('/housing/create', requireAuth, (req, res) => res.render('createHousing', { user: req.user || { id: 1, username: 'test' } }));
app.get('/housing/:id/view', requireAuth, (req, res) => res.render('housingDetail', { user: req.user || { id: 1, username: 'test' } }));
app.get('/housing/:id/edit', requireAuth, (req, res) => res.render('editHousing', { user: req.user || { id: 1, username: 'test' } }));
app.get('/buddies', requireAuth, (req, res) => res.render('buddyList', { user: req.user || { id: 1, username: 'test' } }));
app.get('/buddies/create', requireAuth, (req, res) => res.render('createBuddy', { user: req.user || { id: 1, username: 'test' } }));
app.get('/buddies/:id/view', requireAuth, (req, res) => res.render('buddyDetail', { user: req.user || { id: 1, username: 'test' } }));
app.get('/buddies/:id/edit', requireAuth, (req, res) => res.render('editBuddy', { user: req.user || { id: 1, username: 'test' } }));

// Profile frontend
app.get('/profile', requireAuth, (req, res) => {
  // Get full user data from database to include profile picture
  const UserModel = require('./models/userModel');
  UserModel.findById(req.user.id, (err, results) => {
    if (err || !results || results.length === 0) {
      return res.render('profile', {
        user: req.user || { id: 1, username: 'test' },
        tab: req.query.tab
      });
    }
    const userData = results[0];
    delete userData.password_hash; // Remove sensitive data
    res.render('profile', {
      user: userData,
      tab: req.query.tab
    });
  });
});



// Messages frontend
app.get('/messages', requireAuth, (req, res) => res.render('messages', { user: req.user || { id: 1, username: 'test' } }));

// Roommate frontend pages
app.get('/roommates', requireAuth, (req, res) => {
  console.log('Roommates route - req.user:', req.user);
  res.render('roommateList', { user: req.user || { id: 1, username: 'test' } });
});
app.get('/roommates/create', requireAuth, (req, res) => res.render('createRoommate', { user: req.user || { id: 1, username: 'test' }, edit: false }));
app.get('/roommates/:id/view', (req, res) => res.render('roommateDetail', { user: req.user || null }));
app.get('/roommates/:id/edit', requireAuth, (req, res) => res.render('editRoommate', { user: req.user || { id: 1, username: 'test' }, id: req.params.id }));

// Dashboard
app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// Root route
app.get('/', (req, res) => {
  res.render('index');
});

// Auth routes
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3007;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
