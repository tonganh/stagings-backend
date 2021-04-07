/* eslint-disable global-require */
const router = new require('express').Router();
const EmployeeAdmin = require('../controllers/employees.controller');
const Employees = new EmployeeAdmin();
const Multer = require('multer');
router.post(
  '/uploadImage/:id',
  Multer({ storage: Multer.memoryStorage() }).single('img'),
  Employees.uploadImage.bind(Employees)
);
router.post('/register', Employees.createUser);
router.post('/search', Employees.searchByOption.bind(Employees));
router.patch('/payment/:id', Employees.updatePayment.bind(Employees));
router.post('/payment', Employees.addBankInfo.bind(Employees));
router.delete('/', Employees.deleteUser.bind(Employees));
router.patch('/:id', Employees.updateUserFullInfor.bind(Employees));
router.get('/', Employees.getAllEmployees.bind(Employees));
router.get('/:id', Employees.getUserInfor.bind(Employees));
module.exports = router;
