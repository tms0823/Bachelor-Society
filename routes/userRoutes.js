const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../utils/fileUpload');

router.get('/dashboard', authMiddleware, UserController.getDashboard);
router.get('/me', authMiddleware, UserController.getMe);
router.put('/me', authMiddleware, upload.any(), UserController.updateMe);
router.get('/:id', UserController.getPublic);

module.exports = router;
