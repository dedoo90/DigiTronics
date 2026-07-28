const { error } = require('../utils/apiResponse');

function getDashboard(req, res) { error(res, 'Dashboard endpoints not implemented', 501); }
function getKpis(req, res) { error(res, 'Dashboard endpoints not implemented', 501); }

module.exports = { getDashboard, getKpis };
