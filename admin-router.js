const express = require('express');
const router = express.Router();
const { Employee } = require('./controllers/users');

router.get('/salary', Employee.salary);

module.exports = router;
