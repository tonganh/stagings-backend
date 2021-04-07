/* eslint-disable global-require */
const router = new require('express').Router();
const OtsController = require('../controllers/ots.controller');
const Ots = new OtsController();
router.post('/:id', Ots.requestApproval.bind(Ots));
router.get('/ot-download', Ots.exportExcel.bind(Ots));
router.get('/', Ots.getAllOts.bind(Ots));
router.post('/', Ots.searchHaveCondition.bind(Ots));

module.exports = router;
