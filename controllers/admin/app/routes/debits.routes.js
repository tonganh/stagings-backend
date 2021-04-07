const DebitsController = require('../controllers/debits.controller');

const router = new require('express').Router();
const Debits = new DebitsController();

router.get('/', Debits.getAllDebits.bind(Debits));
router.post('/search', Debits.searchAllDebits.bind(Debits));
router.post('/:id', Debits.requestApproval.bind(Debits));
module.exports = router;
