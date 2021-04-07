require('dotenv').config();
const mongoose = require('mongoose');

const mongoURL = 'mongodb://hisoft:vwNr34gG9vHamX7c@localhost:27017';
console.log(
  `🛠 LOG: 🚀 --> ----------------------------------------------------------------------`
);
console.log(
  `🛠 LOG: 🚀 --> ~ file: md-seed-config.js ~ line 9 ~ mongoURL`,
  mongoURL
);
console.log(
  `🛠 LOG: 🚀 --> ----------------------------------------------------------------------`
);
/**
 * Seeders List
 * order is important
 * @type {Object}
 */

const Projects = require('./seeders/projects.seeder');
const Employees = require('./seeders/employees.seeder');
const Ots = require('./seeders/ots.seeder');
const Onsites = require('./seeders/onsites.seeder');
const Sessions = require('./seeders/session.seeder');
const Treatments = require('./seeders/treatment.seeder');
const Salaries = require('./seeders/salaries.seeder');
const Debits = require('./seeders/debits.seeders');

const seedersList = {
  Employees,
  Projects,
  Ots,
  Onsites,
  Sessions,
  Treatments,
  Salaries,
  Debits,
};

/**
 * Connect to mongodb implementation
 * @return {Promise}
 */
const connect = async () =>
  await mongoose.connect(mongoURL, { useNewUrlParser: true, dbName: 'hisoft-eps-db' });
/**
 * Drop/Clear the database implementation
 * @return {Promise}
 */
const dropdb = async () => {};

module.exports = {
  seedersList,
  connect,
  dropdb,
};
