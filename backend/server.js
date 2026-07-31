const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config');
const logger = require('./utils/logger');
const { notFound, serverError } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

const app = express();

// Global middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
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

app.use('/api/v1', apiRouter);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/inventory-transactions', inventoryTransactionsRoutes);
app.use('/api/v1/customers', customersRoutes);
app.use('/api/v1/suppliers', suppliersRoutes);
app.use('/api/v1/treasury', treasuryRoutes);
app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/partners', partnersRoutes);
app.use('/api/v1/vouchers', voucherRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/auth', authRoutes);

// Error handling
app.use(notFound);
app.use(serverError);

// Start server
app.listen(config.port, () => {
  logger.info(`DigiTronics API v1.0 running on port ${config.port}`);
  logger.info(`Health check: http://localhost:${config.port}/api/v1/health`);
});

module.exports = app;
