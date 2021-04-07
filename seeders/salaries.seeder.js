const { Seeder } = require('mongoose-data-seed');
const Employee = require('../models/employees');
const Salaries = require('../models/salaries.model');

const lastDayInMonth = (month, year) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  return { lastDay: lastDay.getDate(), firstDay: firstDay.getDate() };
};
const monthInsertDB = (month, year) => {
  if (month < 10) {
    return `0${month}-${year}`;
  } else return `${month}-${year}`;
};
class SalariesSeeder extends Seeder {
  async shouldRun() {
    // Input month and year want to set data in salaries table.
    const month = 1;
    const year = 2021;
    const { lastDay, firstDay } = await lastDayInMonth(month, year);
    console.log('lastday, firstday', lastDay, firstDay);
    // GET LIST EMPLOYEE NOW DOING IN COMPANY.
    const listEmployee = await Employee.find({ state: 'DOING' });
    // base data in salary
    const salaryInit = {
      ot: 0,
      subsidize: 0,
      month: monthInsertDB(month, year),
      advancePayment: 0,
      total: 0,
      onsite: 0,
      state: false,
      start: firstDay,
      end: lastDay,
      paidDate: '',
      note: '',
      // treatmentID: '',
    };
    await Promise.all(
      listEmployee.map(async (item) => {
        const dataInsert = {
          ...salaryInit,
          employee: item._id,
        };
        if (item._id !== '') {
          await Salaries.create(dataInsert);
        }
      })
    );
  }
  async run() {}
}

module.exports = SalariesSeeder;
