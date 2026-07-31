const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');

router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', ctrl.me);
router.get('/roles', ctrl.roles);
router.get('/permissions', ctrl.permissions);

module.exports = router;
