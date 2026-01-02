const db = require('../config/db');

const BuddyModel = {
  create: (data, cb) => {
    const {
      owner_id, activity_type, location, date_time, description, max_participants,
      gender_preference, min_age, max_age, cost_per_person, photos, is_private
    } = data;

    const sql = `INSERT INTO buddies (
      owner_id, activity_type, location, date_time, description, max_participants,
      gender_preference, min_age, max_age, cost_per_person, photos, is_private
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      owner_id, activity_type, location, date_time, description, max_participants || 10,
      gender_preference || 'any',
      min_age || 18,
      max_age || 99,
      cost_per_person || 0,
      photos || null,
      is_private || false
    ];

    db.query(sql, values, cb);
  },

  list: (filters, cb) => {
    // Simplified query like roommates model - no complex JOINs
    let sql = `SELECT b.*, u.username as owner_username, u.profile_picture as owner_profile_picture FROM buddies b LEFT JOIN users u ON b.owner_id = u.id`;
    const where = [];
    const params = [];

    if (filters) {
      // Privacy filter or owner filter - simplified
      if (filters.owner && filters.user_id) {
        // Show only user's own posts
        where.push('b.owner_id = ?');
        params.push(filters.user_id);
      } else if (filters.user_id) {
        where.push('(b.is_private = FALSE OR b.owner_id = ?)');
        params.push(filters.user_id);
      } else {
        where.push('b.is_private = FALSE');
      }
    } else {
      where.push('b.is_private = FALSE');
    }

    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY b.created_at DESC';

    db.query(sql, params, cb);
  },

  findById: (id, cb) => {
    const sql = `SELECT
      b.*,
      u.name as owner_name,
      u.username as owner_username,
      u.profile_picture as owner_profile_picture,
      COUNT(bp.id) as participant_count
    FROM buddies b
    LEFT JOIN users u ON b.owner_id = u.id
    LEFT JOIN buddy_participants bp ON b.id = bp.buddy_id AND bp.status = 'joined'
    WHERE b.id = ?
    GROUP BY b.id LIMIT 1`;
    db.query(sql, [id], cb);
  },

  // Get participants for a buddy activity
  getParticipants: (buddyId, cb) => {
    const sql = `SELECT
      bp.*,
      u.username,
      u.email
    FROM buddy_participants bp
    JOIN users u ON bp.user_id = u.id
    WHERE bp.buddy_id = ?
    ORDER BY bp.joined_at ASC`;
    db.query(sql, [buddyId], cb);
  },

  // Join a buddy activity
  joinBuddy: (buddyId, userId, cb) => {
    const sql = `INSERT INTO buddy_participants (buddy_id, user_id, status) VALUES (?, ?, 'joined')
                 ON DUPLICATE KEY UPDATE status = 'joined', joined_at = CURRENT_TIMESTAMP`;
    db.query(sql, [buddyId, userId], cb);
  },

  // Leave a buddy activity
  leaveBuddy: (buddyId, userId, cb) => {
    const sql = `DELETE FROM buddy_participants WHERE buddy_id = ? AND user_id = ?`;
    db.query(sql, [buddyId, userId], cb);
  },

  // Check if user is participating
  isParticipating: (buddyId, userId, cb) => {
    const sql = `SELECT * FROM buddy_participants WHERE buddy_id = ? AND user_id = ? AND status = 'joined' LIMIT 1`;
    db.query(sql, [buddyId, userId], cb);
  },

  update: (id, data, cb) => {
    const fields = [];
    const values = [];
    Object.keys(data).forEach(k => {
      fields.push(`${k} = ?`);
      values.push(data[k]);
    });
    if (!fields.length) return cb(null, { affectedRows: 0 });
    const sql = `UPDATE buddies SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(sql, values, cb);
  },

  delete: (id, cb) => {
    const sql = `DELETE FROM buddies WHERE id = ?`;
    db.query(sql, [id], cb);
  }
};

module.exports = BuddyModel;
