const router = new require('express').Router();
const TreatmentControllers = require('../controllers/treatment.controller');
const Treatments = new TreatmentControllers();
router.get('/:id', Treatments.getDetailEmployeeTreatment.bind(Treatments));
router.delete('/:id', Treatments.deleteTreatment.bind(Treatments));
router.post('/', Treatments.addTreatMent.bind(Treatments));
module.exports = router;
