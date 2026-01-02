const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Admin view routes (before auth middleware for easier access)
router.get('/dashboard', authMiddleware, adminMiddleware, (req, res) => {
  res.render('admin-dashboard', { layout: 'admin-layout', title: 'Admin Dashboard', user: req.user });
});

router.get('/users', authMiddleware, adminMiddleware, (req, res) => {
  res.render('admin-users', { layout: 'admin-layout', title: 'User Management', user: req.user });
});

router.get('/housing', authMiddleware, adminMiddleware, (req, res) => {
  res.render('admin-housing', { layout: 'admin-layout', title: 'Housing Posts Management', user: req.user });
});

router.get('/roommates', authMiddleware, adminMiddleware, (req, res) => {
  res.render('admin-roommates', { layout: 'admin-layout', title: 'Roommate Posts Management', user: req.user });
});

router.get('/activities', authMiddleware, adminMiddleware, (req, res) => {
  res.render('admin-activities', { layout: 'admin-layout', title: 'Activity Posts Management', user: req.user });
});

// All admin API routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/stats', AdminController.getStats);

// User management
router.get('/users', AdminController.getUsers);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// Content management
router.get('/housing', AdminController.getAllHousing);
router.get('/roommates', AdminController.getAllRoommates);
router.get('/buddies', AdminController.getAllBuddies);
router.get('/messages', AdminController.getAllMessages);

// Content moderation
router.delete('/housing/:id', AdminController.deleteHousing);
router.delete('/roommates/:id', AdminController.deleteRoommate);
router.delete('/buddies/:id', AdminController.deleteBuddy);
router.delete('/messages/:id', AdminController.deleteMessage);


module.exports = router;
