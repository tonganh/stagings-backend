const { Seeder } = require('mongoose-data-seed');
const Employee = require('../models/employees');
const moment = require('moment');
const Debits = require('../models/debits');
class DebitsSeeders extends Seeder {
  async shouldRun() {
    const listEmployees = await Employee.find({});
    // Get current time have type: year-month-day
    const currentDay = moment().format('YYYY MM DD');
    const currentTime = moment(currentDay, 'YYYY MM DD');
    // have same timezone
    console.log('test', moment(currentTime, 'YYYY MM DD'));
    const debitInit = {
      amount: 1000000,
      sent: true,
      date: currentTime,
      dayWantReceiveMoney: currentTime,
      content: '',
      status: 'APPROVAL',
      reason: '',
      transdate: currentTime,
    };
    await Promise.all(
      listEmployees.map(async (employee) => {
        const dataInsert = { ...debitInit, employee: employee._id };
        if (employee._id !== '') {
          await Debits.create(dataInsert);
        }
      })
    );
  }
  async run() {}
}
module.exports = DebitsSeeders;
