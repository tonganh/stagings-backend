/* eslint-disable global-require */
const router = new require('express').Router();
const SalaryControllers = require('../controllers/salary.controller');
const Salary = new SalaryControllers();
router.post('/update/:salaryID', Salary.updateSalary.bind(Salary));
router.get('/error/:id', Salary.getDetailError.bind(Salary));
router.get('/:month', Salary.search.bind(Salary));
// router.get('/', Salary.getListSalary);
router.post('/caculate/:month', Salary.caculateSalaries.bind(Salary));
router.post('/filter/:month', Salary.filter.bind(Salary));
module.exports = router;
