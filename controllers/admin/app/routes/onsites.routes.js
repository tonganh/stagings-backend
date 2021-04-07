/* eslint-disable global-require */
const router = new require('express').Router();
const OnsitesControllers = require('../controllers/onsites.controller');
const Onsites = new OnsitesControllers();
router.post('/:id', Onsites.requestApproval.bind(Onsites));
router.get('/', Onsites.getAllOnsites.bind(Onsites));
router.post('/', Onsites.searchHaveConditions.bind(Onsites));
router.get('/onsite-download', Onsites.exportExcel.bind(Onsites));

module.exports = router;
