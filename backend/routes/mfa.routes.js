const router = require('express').Router();
const ctrl = require('../controllers/mfa.controller');
const { requireAuth } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/security');

router.post('/enable', requireAuth, ctrl.enable);
router.post('/disable', requireAuth, ctrl.disable);
router.post('/verify', requireAuth, ctrl.verify);
router.get('/secret', requireAuth, ctrl.getSecret);
router.get('/status', requireAuth, ctrl.getStatus);
router.post('/backup-codes', requireAuth, ctrl.generateBackupCodes);

module.exports = router;
