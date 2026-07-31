const usersService = require('../services/users.service');
const { success, error } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const KNOWN_ROLES = ['Owner', 'Admin', 'Manager', 'Cashier', 'Technician', 'WarehouseSales'];

function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || password === undefined || password === null) return error(res, 'username and password are required', 400);
    const user = usersService.authenticate(username, password);
    if (!user) return error(res, 'Invalid username or password', 401);
    success(res, { user }, 'Login successful');
  } catch (err) {
    logger.error('auth.login error:', err.message);
    error(res, 'Failed to login', 500);
  }
}

function logout(req, res) {
  try {
    success(res, null, 'Logout successful');
  } catch (err) {
    logger.error('auth.logout error:', err.message);
    error(res, 'Failed to logout', 500);
  }
}

function me(req, res) {
  try {
    const username = req.query.username;
    if (!username) return error(res, 'username is required', 400);
    const user = usersService.getByUsername(username);
    if (!user) return error(res, 'User not found', 404);
    success(res, { user }, 'Current user retrieved');
  } catch (err) {
    logger.error('auth.me error:', err.message);
    error(res, 'Failed to retrieve current user', 500);
  }
}

function roles(req, res) {
  try {
    const st = usersService.stats();
    const fromStore = Object.keys(st.roles).map(r => r.charAt(0).toUpperCase() + r.slice(1));
    const all = [...new Set([...KNOWN_ROLES, ...fromStore])];
    success(res, { roles: all }, 'Roles retrieved');
  } catch (err) {
    logger.error('auth.roles error:', err.message);
    error(res, 'Failed to retrieve roles', 500);
  }
}

function permissions(req, res) {
  try {
    const username = req.query.username;
    if (!username) return error(res, 'username is required', 400);
    const user = usersService.getByUsername(username);
    if (!user) return error(res, 'User not found', 404);
    success(res, { username: user.username, role: user.role || '', permissions: Array.isArray(user.permissions) ? user.permissions : [] }, 'Permissions retrieved');
  } catch (err) {
    logger.error('auth.permissions error:', err.message);
    error(res, 'Failed to retrieve permissions', 500);
  }
}

module.exports = { login, logout, me, roles, permissions };
