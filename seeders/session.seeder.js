const { Seeder } = require('mongoose-data-seed');
const Sessions = require('../models/sessions');
const moment = require('moment');

const data = [
  {
    email: 'anh.tn123@sis.hust.edu.vn',
    token: '1233',
    expired: moment().add(0.5, 'hours').toDate(),
  },
];

class SessionsSeeder extends Seeder {
  async shouldRun() {
    return Sessions.countDocuments()
      .exec()
      .then((count) => count === 0);
  }

  async run() {
    return Sessions.create(data);
  }
}

module.exports = SessionsSeeder;
