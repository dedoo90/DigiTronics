const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3001,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  authRequired: process.env.AUTH_REQUIRED === 'true',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || ''
  },
  env: process.env.NODE_ENV || 'development'
};
