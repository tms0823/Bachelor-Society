const jwt = require('jsonwebtoken');

module.exports = {
  sign: (payload, options = {}) => {
    const secret = process.env.JWT_SECRET || 'change_this_secret';
    const opts = Object.assign({ expiresIn: '7d' }, options);
    return jwt.sign(payload, secret, opts);
  },

  verify: (token) => {
    const secret = process.env.JWT_SECRET || 'change_this_secret';
    return jwt.verify(token, secret);
  }
};
