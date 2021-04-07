const { Seeder } = require('mongoose-data-seed');
const Employees = require('../models/employees');
const Projects = require('../models/projects');
const Ots = require('../models/ots');
const moment = require('moment');

class OtsSeeder extends Seeder {
  async shouldRun() {
    const valueInApproved = [0, 1, 2];

    const result = await (await Ots.find({})).forEach(async (otsUpdate) => {
      const random = Math.floor(Math.random() * valueInApproved.length);
      const approved = valueInApproved[random];
      await Ots.findOneAndUpdate(
        { _id: otsUpdate._id },
        {
          approved: approved,
        },
        {
          new: true,
        }
      );
    });
    console.log('result', result);
    return Ots.countDocuments()
      .exec()
      .then((count) => count === 0);
  }

  async run() {
    // const empSeed = await Employees.findOne({ role: 'EM' });
    // const adSeed = await Employees.findOne({ role: 'AD' });
    // const projSeed = await Projects.findOne({ name: 'SCF' });
    // const data = [
    //   {
    //     employee: empSeed._id,
    //     project: projSeed._id,
    //     ship: 'TOI',
    //     date: moment('2020-11-06').utc(),
    //     from: '21h00',
    //     to: '23h00',
    //     note: '',
    //     approved: false,
    //     reason: '',
    //     createdBy: adSeed._id,
    //   },
    //   {
    //     employee: empSeed._id,
    //     project: projSeed._id,
    //     ship: 'TOI',
    //     date: moment('2020-11-07').utc(),
    //     from: '21h00',
    //     to: '23h00',
    //     note: '',
    //     approved: false,
    //     reason: '',
    //     createdBy: adSeed._id,
    //   },
    //   {
    //     employee: empSeed._id,
    //     project: projSeed._id,
    //     ship: 'TOI',
    //     date: moment('2020-11-08').utc(),
    //     from: '21h00',
    //     to: '23h00',
    //     note: '',
    //     approved: false,
    //     reason: '',
    //     createdBy: adSeed._id,
    //   },
    // ];
    // return Ots.create(data);
  }
}

module.exports = OtsSeeder;
