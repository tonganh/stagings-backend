const { Router } = require('express');
const Projects = require('./projects.routes');
const Employees = require('./employees.routes');
const Onsites = require('./onsites.routes');
const Ots = require('./ots.routes');
const Salaries = require('./salary.routes');
const Login = require('./login.routes');
const Treatment = require('./treatment.routes');
const Debit = require('./debits.routes');
const ForgotPassword = require('./forgotpassword.routes');

const Routes = new Router();
Routes.use('/employees', Employees);
Routes.use('/login', Login);
Routes.use('/onsites', Onsites);
Routes.use('/ots', Ots);
Routes.use('/projects', Projects);
Routes.use('/salaries', Salaries);
Routes.use('/treatment', Treatment);
Routes.use('/debit', Debit);
Routes.use('/forgot-password', ForgotPassword);

module.exports = Routes;
