const { error: errorResponse } = require('../utils/apiResponse');

function validate(schema) {
  return (req, res, next) => {
    // Placeholder – validation not yet implemented
    next();
  };
}

module.exports = { validate };
