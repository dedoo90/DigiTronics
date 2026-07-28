const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');

router.get('/', ctrl.getDashboard);
router.get('/kpis', ctrl.getKpis);

module.exports = router;
