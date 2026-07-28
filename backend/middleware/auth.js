const { error: errorResponse } = require('../utils/apiResponse');

function authMiddleware(req, res, next) {
  // Placeholder – no authentication logic yet
  req.user = null;
  next();
}

function requireAuth(req, res, next) {
  // Placeholder – all requests pass through for now
  next();
}

module.exports = { authMiddleware, requireAuth };
