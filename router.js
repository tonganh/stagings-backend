const express = require('express');
const router = new express.Router();

const {
  Projects,
  Auth,
  Onsite,
  Ots,
  Employee,
  Debits,
} = require('./controllers/users');
router.get('/employees/detail/:id', Employee.getUserInfor);
router.post('/employees/update', Employee.updateUserInfor);
router.post('/employees/banks/', Employee.addPaymentInformation);
router.patch('/employees/banks', Employee.updatePayment);

router.get('/', Projects.all);

router.post('/onsite', Onsite.add);
router.post('/onsite/search', Onsite.search);
router.delete('/onsite/:id', Onsite.delete);
router.put('/onsite/:id', Onsite.update);

router.post('/ot', Ots.add);
router.post('/ot/search', Ots.search);
router.delete('/ot/:id', Ots.delete);
router.put('/ot/:id', Ots.update);

router.get('/projects', Projects.all);
router.get('/projects/:id', Projects.detail);
router.get('/projects/:id/members', Projects.members);

// Debit
router.post('/debits/', Debits.createDebit);
router.get('/debits/', Debits.getListDebits);
router.patch('/debits/:id', Debits.updateDebit);
router.delete('/debits/:id', Debits.deleteDebit);

router.post('/check-token-expired', Auth.checkTokenExprired);
router.post('/login', Auth.login);
router.post('/change-password', Auth.changePass);
router.post('/send-email', Auth.sendEmail);
router.post('/forgot-password', Auth.forgotPassword);

module.exports = router;
