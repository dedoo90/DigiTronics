const { error } = require('../utils/apiResponse');

function getReport(req, res) { error(res, 'Report endpoints not implemented', 501); }
function listReports(req, res) { error(res, 'Report endpoints not implemented', 501); }

module.exports = { getReport, listReports };
