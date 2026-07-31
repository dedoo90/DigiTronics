const router = require('express').Router();
const ctrl = require('../controllers/reports.controller');

router.get('/', ctrl.list);
router.get('/stats', ctrl.getStats);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
