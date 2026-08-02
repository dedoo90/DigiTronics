const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3001,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  authRequired: process.env.AUTH_REQUIRED === 'true',
  corsOrigins: process.env.CORS_ORIGINS || '',
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 1000,
  bodyLimit: process.env.BODY_LIMIT || '10mb',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || ''
  },
  env: process.env.NODE_ENV || 'development'
};
