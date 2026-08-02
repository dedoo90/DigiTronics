// Child-process entry used by testServer.js.
// Wraps server.js with an IPC shutdown channel so tests can stop the
// child cleanly (process.exit runs V8 coverage flushes on Windows,
// where signal-based termination is always a hard kill).
process.on('message', m => {
  if (m === 'shutdown') process.exit(0);
});

require('../../server.js');
