const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Tests point DIGITRONICS_DATA_DIR at an isolated temp directory; when the
// variable is unset the default location (and runtime behavior) is unchanged.
const DATA_DIR = process.env.DIGITRONICS_DATA_DIR
  ? path.resolve(process.env.DIGITRONICS_DATA_DIR)
  : path.join(__dirname, '..', 'data');

const fileStore = {
  _ensureDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  },
  read(name) {
    const filePath = path.join(DATA_DIR, name + '.json');
    try {
      if (!fs.existsSync(filePath)) {
        const empty = name === 'sales' ? { invoices: [] } : {};
        fileStore.write(name, empty);
        return empty;
      }
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      logger.error(`fileStore.read('${name}') failed:`, err.message);
      // JSON.parse throws SyntaxError on corruption; detect it by type,
      // not by error-message text (which varies across Node versions).
      if (err instanceof SyntaxError) {
        logger.warn(`Corrupted ${name}.json – resetting`);
        const empty = name === 'sales' ? { invoices: [] } : {};
        fileStore.write(name, empty);
        return empty;
      }
      return name === 'sales' ? { invoices: [] } : {};
    }
  },
  write(name, data) {
    this._ensureDir();
    const filePath = path.join(DATA_DIR, name + '.json');
    const tmpPath = filePath + '.tmp';
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, filePath);
      return true;
    } catch (err) {
      logger.error(`fileStore.write('${name}') failed:`, err.message);
      try { if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath); } catch (_) {}
      return false;
    }
  }
};

module.exports = fileStore;