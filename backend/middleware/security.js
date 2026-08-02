const rateLimit = require('express-rate-limit');
const { error: errorResponse } = require('../utils/apiResponse');

// Recursively remove dangerous keys from parsed JSON bodies:
// prototype-pollution vectors (__proto__/constructor/prototype)
// and operator-injection-style keys ($where, $gt, ...).
function _deepSanitize(value) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = _deepSanitize(value[i]);
    return value;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype' || key.startsWith('$')) {
        delete value[key];
      } else {
        value[key] = _deepSanitize(value[key]);
      }
    }
  }
  return value;
}

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') _deepSanitize(req.body);
  next();
}

// Turns body-parser JSON syntax errors into a consistent 400 response
// instead of a leaked 500.
function jsonParseErrorHandler(err, req, res, next) {
  if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) {
    const status = err.type === 'entity.too.large' ? 413 : 400;
    const msg = err.type === 'entity.too.large' ? 'Payload too large' : 'Malformed JSON payload';
    return errorResponse(res, msg, status);
  }
  next(err);
}

// Generous defaults — throttles abuse without changing normal behavior.
function apiRateLimiter(max) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: max || 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later', data: null }
  });
}

module.exports = { sanitizeBody, jsonParseErrorHandler, apiRateLimiter };
