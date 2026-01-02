const db = require("../config/db");

const HousingModel = {
  // Create a housing listing
  createHousing: (data, callback) => {
    const {
      address, area, rent, available_from, rooms, user_id,
      property_type, gender_preference, lease_duration_months,
      allowed_residents, smoking_allowed, pets_allowed,
      religion_preference, university_preference, max_occupants,
      photos, is_private
    } = data;

    const sql = `
      INSERT INTO housing (
        address, area, rent, available_from, rooms, user_id,
        property_type, gender_preference, lease_duration_months,
        allowed_residents, smoking_allowed, pets_allowed,
        religion_preference, university_preference, max_occupants,
        photos, is_private
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      address, area, rent, available_from, rooms, user_id,
      property_type || 'apartment',
      gender_preference || 'any',
      lease_duration_months || 12,
      allowed_residents || 'anyone',
      smoking_allowed !== undefined ? smoking_allowed : true,
      pets_allowed !== undefined ? pets_allowed : true,
      religion_preference || null,
      university_preference || null,
      max_occupants || null,
      photos ? JSON.stringify(photos) : null,
      is_private || false
    ];

    db.query(sql, values, callback);
  },

  // Get all housing listings
  getAllHousing: (filters, callback) => {
    let sql = `SELECT h.*, u.name as owner_name, u.username as owner_username, u.profile_picture as owner_profile_picture FROM housing h LEFT JOIN users u ON h.user_id = u.id`;
    const where = [];
    const params = [];

    if (filters) {
      // Basic filters
      if (filters.min_rent) {
        where.push('h.rent >= ?');
        params.push(filters.min_rent);
      }
      if (filters.max_rent) {
        where.push('h.rent <= ?');
        params.push(filters.max_rent);
      }
      if (filters.rooms) {
        where.push('h.rooms = ?');
        params.push(filters.rooms);
      }
      if (filters.q) {
        where.push('h.address LIKE ?');
        params.push('%' + filters.q + '%');
      }

      // Area/location based
      if (filters.area) {
        where.push('h.area LIKE ?');
        params.push('%' + filters.area + '%');
      }

      // Gender based
      if (filters.gender_preference && filters.gender_preference !== 'any') {
        where.push('h.gender_preference = ?');
        params.push(filters.gender_preference);
      }

      // Move-in date based
      if (filters.available_from) {
        where.push('h.available_from >= ?');
        params.push(filters.available_from);
      }

      // Duration based
      if (filters.lease_duration_months) {
        where.push('h.lease_duration_months = ?');
        params.push(filters.lease_duration_months);
      }

      // Family/Student/Working allowed
      if (filters.allowed_residents && filters.allowed_residents !== 'anyone') {
        where.push('h.allowed_residents = ?');
        params.push(filters.allowed_residents);
      }

      // Smoking/Pet friendly
      if (filters.smoking_allowed !== undefined) {
        where.push('h.smoking_allowed = ?');
        params.push(filters.smoking_allowed);
      }
      if (filters.pets_allowed !== undefined) {
        where.push('h.pets_allowed = ?');
        params.push(filters.pets_allowed);
      }

      // Religion based
      if (filters.religion_preference) {
        where.push('h.religion_preference = ?');
        params.push(filters.religion_preference);
      }

      // University preference
      if (filters.university_preference) {
        where.push('h.university_preference LIKE ?');
        params.push('%' + filters.university_preference + '%');
      }

      // Number of occupants
      if (filters.max_occupants) {
        where.push('h.max_occupants <= ?');
        params.push(filters.max_occupants);
      }

      // Property type
      if (filters.property_type) {
        where.push('h.property_type = ?');
        params.push(filters.property_type);
      }

      // Privacy filter or owner filter
      if (filters.owner && filters.user_id) {
        // Show only user's own posts
        where.push('h.user_id = ?');
        params.push(filters.user_id);
      } else if (filters.user_id) {
        where.push('(h.is_private = FALSE OR h.user_id = ?)');
        params.push(filters.user_id);
      } else {
        where.push('h.is_private = FALSE');
      }
    } else {
      // Default privacy filter
      where.push('h.is_private = FALSE');
    }

    if (where.length > 0) {
      sql += ' WHERE ' + where.join(' AND ');
    }

    sql += ' ORDER BY h.created_at DESC';

    db.query(sql, params, callback);
  },

  // Get a single housing listing by ID
  getHousingById: (id, callback) => {
    const sql = `SELECT h.*, u.name as owner_name, u.username as owner_username, u.profile_picture as owner_profile_picture FROM housing h LEFT JOIN users u ON h.user_id = u.id WHERE h.id = ? LIMIT 1`;
    db.query(sql, [id], callback);
  },

  // Update a housing listing
  updateHousing: (id, data, callback) => {
    const fields = [];
    const values = [];
    Object.keys(data).forEach(k => { fields.push(`${k} = ?`); values.push(data[k]); });
    if (!fields.length) return callback(null, { affectedRows: 0 });
    const sql = `UPDATE housing SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(sql, values, callback);
  },

  // Delete a housing listing
  deleteHousing: (id, callback) => {
    const sql = `DELETE FROM housing WHERE id = ?`;
    db.query(sql, [id], callback);
  }
};

module.exports = HousingModel;
