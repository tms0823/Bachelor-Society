const MessageModel = require('../models/messageModel');
const UserModel = require('../models/userModel');

const MessageController = {
  // Send a message
  sendMessage: (req, res) => {
    const senderId = req.user.id;
    const { receiver_id, subject, message, related_type, related_id } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ message: 'Receiver and message are required' });
    }

    MessageModel.send({
      sender_id: senderId,
      receiver_id,
      subject,
      message,
      related_type,
      related_id
    }, (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      return res.status(201).json({ message: 'Message sent successfully', id: result.insertId });
    });
  },

  // Get user's message conversations (grouped by conversation threads)
  getUserMessages: (req, res) => {
    const userId = req.user.id;

    MessageModel.getUserMessageConversations(userId, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      return res.json({ conversations: results });
    });
  },

  // Get conversation between two users
  getConversation: (req, res) => {
    const userId = req.user.id;
    const otherUserId = req.params.userId;
    const relatedType = req.query.related_type;
    const relatedId = req.query.related_id ? parseInt(req.query.related_id) : null;

    // Handle general conversations (empty relatedType/relatedId)
    const isGeneral = (!relatedType || relatedType === '') && (!relatedId || relatedId === null);

    MessageModel.getConversationByRelated(userId, otherUserId, isGeneral ? null : relatedType, isGeneral ? null : relatedId, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      return res.json({ messages: results });
    });
  },

  // Mark message as read
  markAsRead: (req, res) => {
    const messageId = req.params.id;
    const userId = req.user.id;

    MessageModel.markAsRead(messageId, userId, (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      return res.json({ message: 'Message marked as read' });
    });
  },

  // Mark conversation as read
  markConversationAsRead: (req, res) => {
    const userId = req.user.id;
    const otherUserId = req.params.userId;
    const relatedType = req.query.related_type;
    const relatedId = req.query.related_id ? parseInt(req.query.related_id) : null;

    MessageModel.markConversationAsRead(userId, otherUserId, relatedType, relatedId, (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      return res.json({ message: 'Conversation marked as read' });
    });
  },

  // Get unread count
  getUnreadCount: (req, res) => {
    const userId = req.user.id;

    MessageModel.getUnreadCount(userId, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      return res.json({ unreadCount: results[0].count });
    });
  },

  // Send message to activity organizer
  contactOrganizer: (req, res) => {
    const senderId = req.user.id;
    const buddyId = req.params.buddyId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get buddy details to find organizer
    const BuddyModel = require('../models/buddyModel');

    BuddyModel.findById(buddyId, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (!results || results.length === 0) return res.status(404).json({ message: 'Activity not found' });

      const buddy = results[0];
      if (buddy.owner_id === senderId) {
        return res.status(400).json({ message: 'You cannot message yourself' });
      }

      // Send message to organizer
      MessageModel.send({
        sender_id: senderId,
        receiver_id: buddy.owner_id,
        subject: `Regarding: ${buddy.activity_type} activity`,
        message,
        related_type: 'buddy',
        related_id: buddyId
      }, (err2, result) => {
        if (err2) {
          console.error('Error sending message:', err2);
          return res.status(500).json({ message: 'Failed to send message' });
        }

        // Success - message sent
        return res.status(200).json({ message: 'Message sent to activity organizer!' });
      });
    });
  }
};

module.exports = MessageController;
