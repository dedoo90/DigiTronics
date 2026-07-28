const { error } = require('../utils/apiResponse');

function list(req, res) { error(res, 'Inventory endpoints not implemented', 501); }
function getById(req, res) { error(res, 'Inventory endpoints not implemented', 501); }
function create(req, res) { error(res, 'Inventory endpoints not implemented', 501); }
function update(req, res) { error(res, 'Inventory endpoints not implemented', 501); }
function remove(req, res) { error(res, 'Inventory endpoints not implemented', 501); }

module.exports = { list, getById, create, update, remove };
