// Child-process entry used by testServer.js.
// Wraps server.js with an IPC shutdown channel so tests can stop the
// child cleanly. Since server.js only listens when run directly, this
// entry performs the listen itself using the exported app.
process.on('message', m => {
  if (m === 'shutdown') process.exit(0);
});

const app = require('../../server.js');
app.listen(process.env.PORT || 3001);
