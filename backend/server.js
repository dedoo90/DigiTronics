const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const session = require('express-session');
const passport = require('passport');
const config = require('./config');
const oauthConfig = require('./config/oauth');
const logger = require('./utils/logger');
const fileStore = require('./utils/fileStore');
const { notFound, serverError, requestPerfLogger } = require('./middleware/errorHandler');
const { authMiddleware, requireAuth } = require('./middleware/auth');
const { writeRoleGuard } = require('./middleware/authorize');
const { sanitizeBody, jsonParseErrorHandler, apiRateLimiter } = require('./middleware/security');
const { validateResource } = require('./middleware/validate');
const { configurePassport } = require('./middleware/passport');

const app = express();

// Global middleware
app.use(helmet());
if (config.corsOrigins) {
  // Restricted CORS: comma-separated allowlist via CORS_ORIGINS.
  app.use(cors({ origin: config.corsOrigins.split(',').map(s => s.trim()), credentials: true }));
} else {
  // Default: open CORS (identical to previous behavior).
  app.use(cors());
}
app.use(compression());
// Request logging is development-only (no console.log in production);
// slow-request performance logging stays on in every environment.
if (config.env === 'development') app.use(morgan('dev'));
app.use(requestPerfLogger(config.slowRequestMs));
app.use(express.json({ limit: config.bodyLimit }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeBody);

// Session middleware (required for OAuth)
if (oauthConfig.enabled) {
  app.use(session(oauthConfig.session));
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());
}

app.use('/api/v1', apiRateLimiter(config.rateLimitMax));
app.use(authMiddleware);

// API v1 routes
const apiRouter = require('./routes/index');
const salesRoutes = require('./routes/sales.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const inventoryTransactionsRoutes = require('./routes/inventoryTransactions.routes');
const customersRoutes = require('./routes/customers.routes');
const suppliersRoutes = require('./routes/suppliers.routes');
const treasuryRoutes = require('./routes/treasury.routes');
const employeesRoutes = require('./routes/employees.routes');
const partnersRoutes = require('./routes/partners.routes');
const voucherRoutes = require('./routes/voucher.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportsRoutes = require('./routes/reports.routes');
const usersRoutes = require('./routes/users.routes');
const authRoutes = require('./routes/auth.routes');
const oauthRoutes = require('./routes/oauth.routes');

app.use('/api/v1', apiRouter);
app.use('/api/v1/auth', authRoutes);

// OAuth routes (mounted at root for OAuth callbacks)
if (oauthConfig.enabled) {
  app.use('/auth', oauthRoutes);
}

// Optional route protection (AUTH_REQUIRED=true).
// Default is OFF: every route stays open exactly as before (legacy behavior).
if (config.authRequired) {
  app.use('/api/v1', requireAuth);
  app.use('/api/v1', writeRoleGuard('Owner', 'Admin', 'Manager'));
}

app.use('/api/v1/sales', validateResource('sales'), salesRoutes);
app.use('/api/v1/purchases', validateResource('purchases'), purchaseRoutes);
app.use('/api/v1/inventory', validateResource('inventory'), inventoryRoutes);
app.use('/api/v1/inventory-transactions', validateResource('inventory-transactions'), inventoryTransactionsRoutes);
app.use('/api/v1/customers', validateResource('customers'), customersRoutes);
app.use('/api/v1/suppliers', validateResource('suppliers'), suppliersRoutes);
app.use('/api/v1/treasury', validateResource('treasury'), treasuryRoutes);
app.use('/api/v1/employees', validateResource('employees'), employeesRoutes);
app.use('/api/v1/partners', validateResource('partners'), partnersRoutes);
app.use('/api/v1/vouchers', validateResource('vouchers'), voucherRoutes);
app.use('/api/v1/dashboard', validateResource('dashboard'), dashboardRoutes);
app.use('/api/v1/reports', validateResource('reports'), reportsRoutes);
app.use('/api/v1/users', validateResource('users'), usersRoutes);

// Error handling
app.use(notFound);
app.use(jsonParseErrorHandler);
app.use(serverError);

// Graceful shutdown: stop accepting connections, flush persistence, close
// the logger, then exit. Writes are synchronous write-through, so there
// is never pending data; flushAll is the stable hook regardless.
function gracefulShutdown(server, exitCode) {
  logger.info('Shutdown signal received — closing gracefully');
  const finish = () => {
    try { fileStore.flushAll(); } catch (_) {}
    logger.close();
    process.exit(exitCode || 0);
  };
  if (server && server.close) {
    server.close(() => finish());
    // Never hang on keep-alive connections.
    setTimeout(finish, 3000).unref();
  } else {
    finish();
  }
}

// Start server only when run directly (`node server.js`). When the app is
// required as a module (tests), the caller controls listening and these
// process-level handlers stay out of the host process.
if (require.main === module) {
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection:', reason && reason.message ? reason.message : reason);
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err.message, err.stack);
    process.exit(1);
  });

  const server = app.listen(config.port, () => {
    if (config.isProduction && config.jwtSecret === 'dev-secret') {
      logger.warn('JWT_SECRET is not set — using the development default. Set JWT_SECRET in production.');
    }
    logger.info(`DigiTronics API v1.0 running on port ${config.port}`);
    logger.info(`Health check: http://localhost:${config.port}/api/v1/health`);
  });

  process.on('SIGINT', () => gracefulShutdown(server, 0));
  process.on('SIGTERM', () => gracefulShutdown(server, 0));
}

module.exports = app;
module.exports.gracefulShutdown = gracefulShutdown;
