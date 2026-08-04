const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { loginRateLimiter } = require('../middleware/security');

router.post('/login', loginRateLimiter(), ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', ctrl.me);
router.get('/roles', ctrl.roles);
router.get('/permissions', ctrl.permissions);

module.exports = router;
