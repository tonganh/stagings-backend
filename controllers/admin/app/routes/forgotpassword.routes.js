/* eslint-disable global-require */
const router = new require('express').Router();
const LoginController = require('../controllers/login.controller');
const Login = new LoginController();
router.post('/', Login.getToken);
router.post('/check-token-expired', Login.checkTokenExprired);
router.post('/send-email', Login.sendEmail);
router.post('/change-password', Login.changePassword);
module.exports = router;
