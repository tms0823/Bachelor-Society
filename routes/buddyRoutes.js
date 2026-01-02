const express = require('express');
const router = express.Router();
const BuddyController = require('../controllers/buddyController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require("../utils/fileUpload");

router.get('/', authMiddleware, BuddyController.list);
router.post('/', authMiddleware, upload.array('photos', 10), BuddyController.create);
router.get('/:id', BuddyController.get);
router.put('/:id', authMiddleware, upload.array('photos', 10), BuddyController.update);
router.delete('/:id', authMiddleware, BuddyController.remove);

// Buddy participation routes
router.post('/:id/join', authMiddleware, BuddyController.join);
router.post('/:id/leave', authMiddleware, BuddyController.leave);
router.get('/:id/participants', BuddyController.getParticipants);

module.exports = router;
