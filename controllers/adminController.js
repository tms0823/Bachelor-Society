const UserModel = require('../models/userModel');
const HousingModel = require('../models/housingModel');

const BuddyModel = require('../models/buddyModel');


const AdminController = {
  // Dashboard stats
  getStats: (req, res) => {
    // Get counts of all entities
    const queries = [
      'SELECT COUNT(*) as users FROM users',
      'SELECT COUNT(*) as housing FROM housing',
      'SELECT COUNT(*) as roommates FROM roommate_requests',
      'SELECT COUNT(*) as buddies FROM buddies',
      'SELECT COUNT(*) as messages FROM messages',
    ];

    const results = {};
    let completed = 0;

    queries.forEach((query, index) => {
      const db = require('../config/db');
      db.query(query, (err, result) => {
        if (err) {
          console.error('Error getting stats:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        const key = query.split(' as ')[1];
        results[key] = result[0][key];
        completed++;

        if (completed === queries.length) {
          res.json({ stats: results });
        }
      });
    });
  },

  // User management
  getUsers: (req, res) => {
    UserModel.findAll ? UserModel.findAll((err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ users: results });
    }) : res.json({ users: [] });
  },

  updateUser: (req, res) => {
    const { id } = req.params;
    const { role, name } = req.body;
    UserModel.updateById(id, { role, name }, (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' });

      res.json({ message: 'User updated', result });
    });
  },

  deleteUser: (req, res) => {
    const { id } = req.params;
    const db = require('../config/db');
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ message: 'User deleted', result });
    });
  },

  // Content management - similar methods for housing, items, services, etc.
  getAllHousing: (req, res) => {
    HousingModel.getAllHousing({}, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ housing: results });
    });
  },





  getAllRoommates: (req, res) => {
    const db = require('../config/db');
    db.query('SELECT rr.*, u.username as owner_username FROM roommate_requests rr LEFT JOIN users u ON rr.owner_id = u.id ORDER BY rr.created_at DESC', (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ roommates: results });
    });
  },

  getAllBuddies: (req, res) => {
    const db = require('../config/db');
    db.query('SELECT b.*, u.username as owner_username FROM buddies b LEFT JOIN users u ON b.owner_id = u.id ORDER BY b.created_at DESC', (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ buddies: results });
    });
  },

  getAllMessages: (req, res) => {
    const db = require('../config/db');
    db.query('SELECT m.*, s.username as sender_username, r.username as receiver_username FROM messages m LEFT JOIN users s ON m.sender_id = s.id LEFT JOIN users r ON m.receiver_id = r.id ORDER BY m.created_at DESC', (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ messages: results });
    });
  },

  // Content moderation methods
  deleteHousing: (req, res) => {
    const { id } = req.params;
    HousingModel.deleteHousing(id, (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ message: 'Housing listing deleted', result });
    });
  },

  deleteRoommate: (req, res) => {
    const { id } = req.params;
    const db = require('../config/db');
    db.query('DELETE FROM roommate_requests WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ message: 'Roommate request deleted', result });
    });
  },

  deleteBuddy: (req, res) => {
    const { id } = req.params;
    const db = require('../config/db');
    db.query('DELETE FROM buddies WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ message: 'Buddy activity deleted', result });
    });
  },

  deleteMessage: (req, res) => {
    const { id } = req.params;
    const db = require('../config/db');
    db.query('DELETE FROM messages WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ message: 'Message deleted', result });
    });
  },
};

module.exports = AdminController;
