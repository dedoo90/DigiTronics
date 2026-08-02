// Spawns the real backend as a child process against an isolated temp
// data directory, waits for readiness, and stops it afterwards.
// Ports are derived from JEST_WORKER_ID so parallel workers never collide.
const { spawn } = require('child_process');
const path = require('path');

const BACKEND_DIR = path.join(__dirname, '..', '..');
const BASE_PORT = 39600;
let instanceCounter = 0;

const TEST_JWT_SECRET = 'test-jwt-secret-for-jest-suites';

function nextPort() {
  const worker = parseInt(process.env.JEST_WORKER_ID || '1', 10);
  instanceCounter += 1;
  return BASE_PORT + worker * 100 + instanceCounter;
}

async function waitForReady(baseUrl, child, timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 15000);
  let lastError = null;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`backend exited early with code ${child.exitCode}: ${child._stderrTail || ''}`);
    }
    try {
      const res = await fetch(baseUrl + '/api/v1/health');
      if (res.ok) return;
    } catch (err) {
      lastError = err;
    }
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error(`backend did not become ready at ${baseUrl}: ${lastError ? lastError.message : 'timeout'}`);
}

// extraEnv may override anything (AUTH_REQUIRED, RATE_LIMIT_MAX, ...).
async function startServer(dataDir, extraEnv) {
  const port = nextPort();
  const child = spawn(process.execPath, [path.join(__dirname, 'childEntry.js')], {
    cwd: BACKEND_DIR,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'test',
      JWT_SECRET: TEST_JWT_SECRET,
      DIGITRONICS_DATA_DIR: dataDir,
      LOG_FILE: '',
      ...(extraEnv || {})
    },
    stdio: ['ignore', 'ignore', 'pipe', 'ipc']
  });
  let stderrTail = '';
  child.stderr.on('data', d => {
    stderrTail = (stderrTail + d.toString()).slice(-2000);
    child._stderrTail = stderrTail;
  });
  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForReady(baseUrl, child);
  return { child, port, baseUrl, dataDir };
}

async function stopServer(server) {
  if (!server || !server.child || server.child.exitCode !== null) return;
  // Ask for a clean exit over IPC first (lets V8 coverage flush on
  // Windows); fall back to a hard kill if the child does not respond.
  try { server.child.send('shutdown'); } catch (_) {
    server.child.kill();
  }
  await new Promise(resolve => {
    const timer = setTimeout(() => {
      try { server.child.kill('SIGKILL'); } catch (_) {}
      resolve();
    }, 5000);
    server.child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

module.exports = { startServer, stopServer, TEST_JWT_SECRET };
