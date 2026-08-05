const router = require('express').Router();
const ctrl = require('../controllers/oauth.controller');
const { loginRateLimiter } = require('../middleware/security');

router.get('/providers', ctrl.getProviders);

router.get('/google', ctrl.initiateGoogle);
router.get('/google/callback', ctrl.callbackGoogle);

router.get('/github', ctrl.initiateGithub);
router.get('/github/callback', ctrl.callbackGithub);

module.exports = router;
