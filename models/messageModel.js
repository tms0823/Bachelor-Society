const db = require('../config/db');

const MessageModel = {
  // Send a message
  send: (data, cb) => {
    const { sender_id, receiver_id, subject, message, related_type, related_id } = data;
    const sql = `INSERT INTO messages (sender_id, receiver_id, subject, message, related_type, related_id) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [sender_id, receiver_id, subject, message, related_type, related_id], cb);
  },

  // Get messages for a user (both sent and received)
  getUserMessages: (userId, cb) => {
    const sql = `SELECT
      m.*,
      CASE
        WHEN m.sender_id = ? THEN 'sent'
        ELSE 'received'
      END as direction,
      CASE
        WHEN m.sender_id = ? THEN r.username
        ELSE s.username
      END as other_username,
      CASE
        WHEN m.sender_id = ? THEN r.email
        ELSE s.email
      END as other_email
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.receiver_id = r.id
    WHERE m.sender_id = ? OR m.receiver_id = ?
    ORDER BY m.created_at DESC`;
    db.query(sql, [userId, userId, userId, userId, userId], cb);
  },

  // Get conversation between two users
  getConversation: (userId1, userId2, cb) => {
    const sql = `SELECT
      m.*,
      u.username as sender_username
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?)
       OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC`;
    db.query(sql, [userId1, userId2, userId2, userId1], cb);
  },

  // Get conversation between two users filtered by related item
  getConversationByRelated: (userId1, userId2, relatedType, relatedId, cb) => {
    let sql;
    let params;

    if (relatedType === null && relatedId === null) {
      // General conversation - related_type IS NULL
      sql = `SELECT
        m.*,
        u.username as sender_username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
         AND m.related_type IS NULL
      ORDER BY m.created_at ASC`;
      params = [userId1, userId2, userId2, userId1];
    } else {
      // Specific conversation
      sql = `SELECT
        m.*,
        u.username as sender_username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE ((m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?))
         AND m.related_type = ? AND m.related_id = ?
      ORDER BY m.created_at ASC`;
      params = [userId1, userId2, userId2, userId1, relatedType, relatedId];
    }

    db.query(sql, params, cb);
  },

  // Mark message as read
  markAsRead: (messageId, userId, cb) => {
    const sql = `UPDATE messages SET is_read = TRUE WHERE id = ? AND receiver_id = ?`;
    db.query(sql, [messageId, userId], cb);
  },

  // Mark all messages in conversation as read
  markConversationAsRead: (userId, otherUserId, relatedType, relatedId, cb) => {
    let sql;
    let params;

    // Handle different conversation types properly
    if (relatedType && relatedId && relatedType !== 'general' && relatedId !== '0' && relatedId !== 0) {
      // Mark messages with specific related type/id
      sql = `UPDATE messages SET is_read = TRUE
             WHERE receiver_id = ? AND sender_id = ?
               AND related_type = ? AND related_id = ? AND is_read = FALSE`;
      params = [userId, otherUserId, relatedType, relatedId];
    } else if ((relatedType === null || relatedType === undefined || relatedType === '' || relatedType === 'general') &&
               (relatedId === null || relatedId === undefined || relatedId === '' || relatedId === '0' || relatedId === 0)) {
      // Mark general messages (where related_type IS NULL)
      sql = `UPDATE messages SET is_read = TRUE
             WHERE receiver_id = ? AND sender_id = ?
               AND (related_type IS NULL OR related_type = '') AND is_read = FALSE`;
      params = [userId, otherUserId];
    } else {
      // Fallback: mark all messages from this sender (shouldn't happen with proper data)
      console.warn('Using fallback conversation read marking:', { userId, otherUserId, relatedType, relatedId });
      sql = `UPDATE messages SET is_read = TRUE
             WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE`;
      params = [userId, otherUserId];
    }

    db.query(sql, params, cb);
  },

  // Get user's message conversations (grouped by conversation threads)
  getUserMessageConversations: (userId, cb) => {
    const sql = `
      SELECT
        -- Conversation identifier (combination of other user and related item)
        CONCAT(
          LEAST(m.sender_id, m.receiver_id),
          '_',
          GREATEST(m.sender_id, m.receiver_id),
          '_',
          COALESCE(m.related_type, 'general'),
          '_',
          COALESCE(m.related_id, '0')
        ) as conversation_id,

        -- Latest message info
        m.id as latest_message_id,
        m.message as latest_message,
        m.subject,
        m.created_at as latest_message_time,
        m.sender_id,
        m.receiver_id,
        m.related_type,
        m.related_id,

        -- Other user info
        CASE
          WHEN m.sender_id = ? THEN r.username
          ELSE s.username
        END as other_username,

        CASE
          WHEN m.sender_id = ? THEN r.email
          ELSE s.email
        END as other_email,

        -- Other user ID
        CASE
          WHEN m.sender_id = ? THEN m.receiver_id
          ELSE m.sender_id
        END as other_user_id,

        -- Unread count for this conversation
        SUM(CASE
          WHEN m.receiver_id = ? AND m.is_read = FALSE THEN 1
          ELSE 0
        END) as unread_count,

        -- Total messages in conversation
        COUNT(*) as total_messages

      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE m.sender_id = ? OR m.receiver_id = ?

      GROUP BY
        LEAST(m.sender_id, m.receiver_id),
        GREATEST(m.sender_id, m.receiver_id),
        m.related_type,
        m.related_id

      ORDER BY latest_message_time DESC
    `;

    db.query(sql, [userId, userId, userId, userId, userId, userId], cb);
  },

  // Get unread count
  getUnreadCount: (userId, cb) => {
    const sql = `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE`;
    db.query(sql, [userId], cb);
  }
};

module.exports = MessageModel;
