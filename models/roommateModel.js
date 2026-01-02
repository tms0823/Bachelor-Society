const db = require('../config/db');

const RoommateModel = {
  create: (data, cb) => {
    const {
      owner_id, preferred_location, budget_min, budget_max, lifestyle, move_in_date, description,
      gender_preference, room_type, lease_duration_preference, occupation,
      smoking_preference, religion, pet_preference, max_roommates, photos, is_private
    } = data;

    const sql = `INSERT INTO roommate_requests (
      owner_id, preferred_location, budget_min, budget_max, lifestyle, move_in_date, description,
      gender_preference, room_type, lease_duration_preference, occupation,
      smoking_preference, religion, pet_preference, max_roommates, photos, is_private
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      owner_id, preferred_location, budget_min, budget_max, lifestyle, move_in_date, description,
      gender_preference || 'any',
      room_type || 'any',
      lease_duration_preference || 12,
      occupation || null,
      smoking_preference || 'any',
      religion || null,
      pet_preference || 'any_pets',
      max_roommates || 1,
      photos ? JSON.stringify(photos) : null,
      is_private || false
    ];

    db.query(sql, values, cb);
  },

  list: (filters, cb) => {
    let sql = `SELECT rr.*, u.username as owner_username, u.profile_picture as owner_profile_picture FROM roommate_requests rr LEFT JOIN users u ON rr.owner_id = u.id`;
    const where = [];
    const params = [];

    if (filters) {
      // Area/location based roommate searching
      if (filters.preferred_location) {
        where.push('rr.preferred_location LIKE ?');
        params.push('%' + filters.preferred_location + '%');
      }

      // Budget range based roommate searching
      if (filters.budget_min) {
        where.push('rr.budget_min >= ?');
        params.push(filters.budget_min);
      }
      if (filters.budget_max) {
        where.push('rr.budget_max <= ?');
        params.push(filters.budget_max);
      }

      // Gender based roommate searching
      if (filters.gender_preference && filters.gender_preference !== 'any') {
        where.push('rr.gender_preference = ?');
        params.push(filters.gender_preference);
      }

      // Move-in date based roommate searching
      if (filters.move_in_date) {
        where.push('rr.move_in_date >= ?');
        params.push(filters.move_in_date);
      }

      // Room type preference based
      if (filters.room_type && filters.room_type !== 'any') {
        where.push('rr.room_type = ?');
        params.push(filters.room_type);
      }

      // Lease duration based
      if (filters.lease_duration_preference) {
        where.push('rr.lease_duration_preference = ?');
        params.push(filters.lease_duration_preference);
      }

      // Occupation based
      if (filters.occupation) {
        where.push('rr.occupation LIKE ?');
        params.push('%' + filters.occupation + '%');
      }

      // Smoking preference based
      if (filters.smoking_preference && filters.smoking_preference !== 'any') {
        where.push('rr.smoking_preference = ?');
        params.push(filters.smoking_preference);
      }

      // Religion based
      if (filters.religion) {
        where.push('rr.religion = ?');
        params.push(filters.religion);
      }

      // Pet preference based
      if (filters.pet_preference && filters.pet_preference !== 'any_pets') {
        where.push('rr.pet_preference = ?');
        params.push(filters.pet_preference);
      }

      // Number of roommates
      if (filters.max_roommates) {
        where.push('rr.max_roommates <= ?');
        params.push(filters.max_roommates);
      }

      // Search query
      if (filters.q) {
        where.push('rr.description LIKE ?');
        params.push('%' + filters.q + '%');
      }

      // Privacy filter or owner filter
      if (filters.owner && filters.user_id) {
        // Show only user's own posts
        where.push('rr.owner_id = ?');
        params.push(filters.user_id);
      } else if (filters.user_id) {
        where.push('(rr.is_private = FALSE OR rr.owner_id = ?)');
        params.push(filters.user_id);
      } else {
        where.push('rr.is_private = FALSE');
      }
    } else {
      where.push('rr.is_private = FALSE');
    }

    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY rr.created_at DESC';

    db.query(sql, params, cb);
  },

  findById: (id, cb) => {
    console.log('Finding roommate by ID:', id, 'Type:', typeof id);
    const sql = `SELECT rr.*, u.name as owner_name, u.username as owner_username, u.profile_picture as owner_profile_picture FROM roommate_requests rr LEFT JOIN users u ON rr.owner_id = u.id WHERE rr.id = ? LIMIT 1`;
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('Database error in findById:', err);
        return cb(err, null);
      }
      console.log('findById results:', results);
      cb(null, results);
    });
  },

  update: (id, data, cb) => {
    const fields = [];
    const values = [];
    Object.keys(data).forEach(k => {
      fields.push(`${k} = ?`);
      values.push(data[k]);
    });
    if (!fields.length) return cb(null, { affectedRows: 0 });
    const sql = `UPDATE roommate_requests SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(sql, values, cb);
  },

  delete: (id, cb) => {
    const sql = `DELETE FROM roommate_requests WHERE id = ?`;
    db.query(sql, [id], cb);
  }
};

module.exports = RoommateModel;
