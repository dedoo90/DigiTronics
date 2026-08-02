const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 10;
const BCRYPT_PREFIX = /^\$2[aby]\$/;

function isBcryptHash(value) {
  return typeof value === 'string' && BCRYPT_PREFIX.test(value);
}

function hashPassword(plain) {
  if (plain === undefined || plain === null) return plain;
  const str = String(plain);
  if (isBcryptHash(str)) return str;
  return bcrypt.hashSync(str, BCRYPT_ROUNDS);
}

// Returns { match: boolean, needsRehash: boolean }
// needsRehash=true means the stored credential was legacy plaintext
// and should be migrated to a bcrypt hash after a successful login.
function verifyPassword(plain, stored) {
  const candidate = String(plain === undefined || plain === null ? '' : plain);
  const current = String(stored === undefined || stored === null ? '' : stored);
  if (isBcryptHash(current)) {
    return { match: bcrypt.compareSync(candidate, current), needsRehash: false };
  }
  // Legacy plaintext comparison (identical semantics to the original code)
  return { match: candidate === current, needsRehash: candidate === current && current !== '' };
}

module.exports = { hashPassword, verifyPassword, isBcryptHash };
