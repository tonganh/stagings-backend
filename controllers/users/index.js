const AuthControllers = require('./auth');
const DebitControllers = require('./debit');
const Employeecontrollers = require('./employees');
const OnsiteControllers = require('./onsites');
const OtControllers = require('./ots');
const ProjectsControllers = require('./projects');

const Employee = new Employeecontrollers();
const Onsite = new OnsiteControllers();
const Projects = new ProjectsControllers();
const Auth = new AuthControllers();
const Ots = new OtControllers();
const Debits = new DebitControllers();
module.exports = {
  Employee,
  Projects,
  Auth,
  Onsite,
  Ots,
  Debits,
};
