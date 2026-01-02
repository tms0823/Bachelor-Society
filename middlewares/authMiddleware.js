const jwtHelper = require('../utils/jwtHelper');

// API authentication middleware (returns JSON)
function authMiddleware(req, res, next) {
  // Check for token in Authorization header first
  let token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;

  // Also check query parameter for convenience (like for dashboard redirects)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  // Check cookie (though cookies aren't working, keep for compatibility)
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check body (for form submissions with token field)
  if (!token && req.body && req.body.token) {
    token = req.body.token;
  }

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwtHelper.verify(token);
    req.user = decoded; // { id, username, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// View authentication middleware (redirects to login)
function requireAuth(req, res, next) {
  // Check for token in Authorization header
  let token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;

  // For view routes, also check query parameter
  if (!token && req.query.token) {
    token = req.query.token;
  }

  // Check cookie (though broken, keep for compatibility)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    // For view routes, redirect to login with return URL
    if (req.accepts('html')) {
      const returnUrl = encodeURIComponent(req.originalUrl);
      return res.redirect(`/login?returnUrl=${returnUrl}`);
    }
    // For API routes, return JSON error
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwtHelper.verify(token);
    req.user = decoded;
    next();
  } catch (err) {
    // For view routes, redirect to login
    if (req.accepts('html')) {
      const returnUrl = encodeURIComponent(req.originalUrl);
      return res.redirect(`/login?returnUrl=${returnUrl}`);
    }
    // For API routes, return JSON error
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
module.exports.requireAuth = requireAuth;
