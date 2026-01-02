const db = require("../config/db");

const UserModel = {
  createUser: (data, callback) => {
    const {
      username,
      email,
      phone,
      password_hash,
      role,
      profile_picture,
    } = data;

    const sql = `
      INSERT INTO users (username, email, phone, password_hash, role, profile_picture)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    console.log('Creating user with data:', { username, email, phone, password_hash: '[HIDDEN]', role, profile_picture });

    db.query(
      sql,
      [username, email, phone, password_hash, role || 'user', profile_picture],
      (err, result) => {
        if (err) {
          console.error('Database error creating user:', err);
          console.error('SQL Message:', err.sqlMessage);
          console.error('SQL State:', err.sqlState);
        } else {
          console.log('User created successfully:', result);
        }
        callback(err, result);
      }
    );
  },

  findByEmail: (email, callback) => {
    const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
    db.query(sql, [email], callback);
  },

  findByPhone: (phone, callback) => {
    const sql = `SELECT * FROM users WHERE phone = ? LIMIT 1`;
    db.query(sql, [phone], callback);
  },

  findById: (id, callback) => {
    const sql = `SELECT * FROM users WHERE id = ? LIMIT 1`;
    db.query(sql, [id], callback);
  },

  findAll: (callback) => {
    const sql = `SELECT id, username, email, phone, role, name, created_at FROM users ORDER BY id`;
    db.query(sql, callback);
  },

  updateById: (id, data, callback) => {
    const fields = [];
    const values = [];
    Object.keys(data).forEach((k) => {
      fields.push(`${k} = ?`);
      values.push(data[k]);
    });
    if (fields.length === 0) return callback(null, { affectedRows: 0 });
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(sql, values, callback);
  }
};

module.exports = UserModel;
