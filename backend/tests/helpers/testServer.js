// Boots the Express app IN-PROCESS for tests. Each call resets the module
// registry, applies the desired environment, and re-requires server.js so
// every instance gets its own config, data directory, rate limiter and
// token store. Coverage instrumentation sees everything because the code
// executes inside the test process.
//
// `baseUrl` is kept for one migration commit: it is backed by an
// ephemeral in-process listener (app.listen(0)) and will be removed in
// the cleanup commit once all suites use `app` directly.
const { makeTempDataDir } = require('./testData');

const TEST_JWT_SECRET = 'test-jwt-secret-for-jest-suites';

// Keys that must be explicitly set or cleared per instance.
const INSTANCE_ENV_KEYS = ['AUTH_REQUIRED', 'RATE_LIMIT_MAX'];

function startServer(dataDir, extraEnv) {
  const dir = dataDir || makeTempDataDir('app');
  jest.resetModules();
  process.env.DIGITRONICS_DATA_DIR = dir;
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  process.env.NODE_ENV = 'test';
  process.env.LOG_FILE = '';
  for (const key of INSTANCE_ENV_KEYS) {
    if (extraEnv && extraEnv[key] !== undefined) process.env[key] = extraEnv[key];
    else delete process.env[key];
  }
  const app = require('../../server.js');
  const httpServer = app.listen(0);
  const baseUrl = `http://127.0.0.1:${httpServer.address().port}`;
  return { app, httpServer, baseUrl, dataDir: dir };
}

async function stopServer(server) {
  if (!server || !server.httpServer) return;
  await new Promise(resolve => {
    const timer = setTimeout(resolve, 2000);
    try {
      server.httpServer.close(() => {
        clearTimeout(timer);
        resolve();
      });
    } catch (_) {
      clearTimeout(timer);
      resolve();
    }
  });
}

module.exports = { startServer, stopServer, TEST_JWT_SECRET };
