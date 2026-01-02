const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, MessageController.sendMessage);
router.get('/', authMiddleware, MessageController.getUserMessages);
router.get('/conversation/:userId', authMiddleware, MessageController.getConversation);
router.put('/:id/read', authMiddleware, MessageController.markAsRead);
router.put('/conversation/:userId/read', authMiddleware, MessageController.markConversationAsRead);
router.get('/unread-count', authMiddleware, MessageController.getUnreadCount);
router.post('/contact-organizer/:buddyId', authMiddleware, MessageController.contactOrganizer);

module.exports = router;
