const fs = require('fs');
const router = require('express').Router();
const { success, error } = require('../utils/apiResponse');
const fileStore = require('../utils/fileStore');

const startedAt = Date.now();

// Liveness: the process is up. Safe diagnostics only — no secrets,
// no environment dump, no config values.
router.get('/health', (req, res) => {
  success(res, {
    version: '1.0',
    status: 'ok',
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000)
  }, 'Service is healthy');
});

router.get('/liveness', (req, res) => {
  const mem = process.memoryUsage();
  success(res, {
    status: 'alive',
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    pid: process.pid,
    node: process.version,
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024 * 10) / 10,
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024 * 10) / 10
    }
  }, 'Process is alive');
});

// Readiness: the service can actually persist — the data directory
// exists and is writable. 503 when not.
router.get('/ready', (req, res) => {
  try {
    fileStore._ensureDir();
    const probe = fileStore._path('.readiness-probe');
    fs.writeFileSync(probe, 'ok', 'utf-8');
    fs.unlinkSync(probe);
    success(res, { status: 'ready', persistence: 'writable' }, 'Service is ready');
  } catch (err) {
    error(res, 'Service is not ready: persistence check failed', 503);
  }
});

module.exports = router;
