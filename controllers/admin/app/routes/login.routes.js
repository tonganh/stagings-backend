/* eslint-disable global-require */
const router = new require('express').Router();
const LoginController = require('../controllers/login.controller');
const Login = new LoginController();
// router.post('/', login.findUser);
router.post('/', Login.getToken);
router.get('/check-token-expired/:token', Login.getDataFromToken);
module.exports = router;
