const { v4: uuidv4 } = require('uuid');
const fileStore = require('../utils/fileStore');
const logger = require('../utils/logger');

const STORE_NAME = 'users';

class UsersService {
  _load() {
    const db = fileStore.read(STORE_NAME);
    if (!db || typeof db !== 'object') return { users: [] };
    if (!Array.isArray(db.users)) db.users = [];
    return db;
  }
  _save(db) { return fileStore.write(STORE_NAME, db); }

  _validateRequired(data, forCreate) {
    const errors = [];
    if (forCreate && (data.username === undefined || data.username === null || String(data.username).trim() === '')) errors.push('username is required');
    if (data.username !== undefined && typeof data.username !== 'string') errors.push('username must be a string');
    if (data.password !== undefined && typeof data.password !== 'string') errors.push('password must be a string');
    if (data.role !== undefined && typeof data.role !== 'string') errors.push('role must be a string');
    if (data.fullName !== undefined && typeof data.fullName !== 'string') errors.push('fullName must be a string');
    if (data.phone !== undefined && typeof data.phone !== 'string') errors.push('phone must be a string');
    return errors;
  }

  _normalizeId(id) {
    return String(id).trim();
  }

  _matchesId(user, normalized) {
    return this._normalizeId(user.id) === normalized || this._normalizeId(user._backendId || '') === normalized;
  }

  list(query = {}) {
    const db = this._load();
    let users = db.users || [];

    if (query.search) {
      const q = String(query.search).toLowerCase();
      users = users.filter(u =>
        String(u.username || '').toLowerCase().includes(q) ||
        String(u.fullName || '').toLowerCase().includes(q) ||
        String(u.role || '').toLowerCase().includes(q) ||
        String(u.phone || '').toLowerCase().includes(q)
      );
    }
    if (query.role) {
      const q = String(query.role).toLowerCase();
      users = users.filter(u => String(u.role || '').toLowerCase() === q);
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    users.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        va = new Date(va || 0).getTime();
        vb = new Date(vb || 0).getTime();
      } else {
        va = String(va || '').toLowerCase();
        vb = String(vb || '').toLowerCase();
      }
      return va < vb ? -sortOrder : va > vb ? sortOrder : 0;
    });

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 50));
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = users.slice(start, start + limit);

    return { users: paginated, total, page, limit, totalPages };
  }

  getById(id) {
    const db = this._load();
    const normalized = this._normalizeId(id);
    return (db.users || []).find(u => this._matchesId(u, normalized)) || null;
  }

  getByUsername(username) {
    const db = this._load();
    const normalized = this._normalizeId(username).toLowerCase();
    return (db.users || []).find(u => String(u.username || '').toLowerCase() === normalized) || null;
  }

  stats() {
    const db = this._load();
    const users = db.users || [];
    const roles = {};
    users.forEach(u => {
      const r = String(u.role || '').toLowerCase();
      if (r) roles[r] = (roles[r] || 0) + 1;
    });
    return { count: users.length, roles };
  }

  create(data) {
    const errors = this._validateRequired(data, true);
    if (errors.length) return { error: errors.join('; ') };

    const db = this._load();
    const user = {
      id: data.id !== undefined && data.id !== null ? data.id : uuidv4(),
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const normalized = this._normalizeId(user.id);
    if ((db.users || []).some(u => this._normalizeId(u.id) === normalized)) {
      return { error: 'Duplicate user ID: ' + user.id };
    }
    if (this.getByUsername(user.username)) {
      return { error: 'Duplicate username: ' + user.username };
    }

    if (!Array.isArray(db.users)) db.users = [];
    db.users.push(user);
    if (this._save(db)) return { user };
    return { error: 'Failed to persist user' };
  }

  update(id, data) {
    const db = this._load();
    const normalized = this._normalizeId(id);
    const idx = (db.users || []).findIndex(u => this._matchesId(u, normalized));
    if (idx === -1) return { error: 'User not found' };

    const errors = this._validateRequired(data, false);
    if (errors.length) return { error: errors.join('; ') };

    if (data.username !== undefined) {
      const clash = (db.users || []).find((u, i) => i !== idx && String(u.username || '').toLowerCase() === String(data.username).toLowerCase());
      if (clash) return { error: 'Duplicate username: ' + data.username };
    }

    db.users[idx] = { ...db.users[idx], ...data, id: db.users[idx].id, updatedAt: new Date().toISOString() };
    if (this._save(db)) return { user: db.users[idx] };
    return { error: 'Failed to persist update' };
  }

  delete(id) {
    const db = this._load();
    const normalized = this._normalizeId(id);
    const idx = (db.users || []).findIndex(u => this._matchesId(u, normalized));
    if (idx === -1) return { error: 'User not found' };
    db.users.splice(idx, 1);
    if (this._save(db)) return { success: true };
    return { error: 'Failed to persist deletion' };
  }

  authenticate(username, password) {
    const user = this.getByUsername(username);
    if (!user) return null;
    if (String(user.password || '') !== String(password || '')) return null;
    return user;
  }
}

module.exports = new UsersService();
