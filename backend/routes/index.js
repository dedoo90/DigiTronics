const router = require('express').Router();
const { success } = require('../utils/apiResponse');

router.get('/health', (req, res) => {
  success(res, {
    version: '1.0',
    status: 'ok'
  }, 'Service is healthy');
});

module.exports = router;
