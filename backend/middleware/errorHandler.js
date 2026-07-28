const logger = require('../utils/logger');
const { error: errorResponse } = require('../utils/apiResponse');

function notFound(req, res, next) {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404);
}

function serverError(err, req, res, next) {
  logger.error('Unhandled error:', err.message, err.stack);
  errorResponse(res, err.message || 'Internal Server Error', 500);
}

module.exports = { notFound, serverError };
