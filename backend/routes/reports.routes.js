const router = require('express').Router();
const ctrl = require('../controllers/reports.controller');

router.get('/', ctrl.listReports);
router.get('/:type', ctrl.getReport);

module.exports = router;
