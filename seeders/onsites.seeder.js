const { Seeder } = require('mongoose-data-seed');
const Onsites = require('../models/onsite');
const Employees = require('../models/employees');
const Projects = require('../models/projects');
const moment = require('moment');

class OnsitesSeeder extends Seeder {
  async shouldRun() {
    // convert approved to type Int32. have value 1
    const valueInApproved = [0, 1, 2];

    const result = await (await Onsites.find({})).forEach(
      async (OnsitesUpdate) => {
        const random = Math.floor(Math.random() * valueInApproved.length);
        const approved = valueInApproved[random];
        await Onsites.findOneAndUpdate(
          { _id: OnsitesUpdate._id },
          {
            approved: approved,
          },
          {
            new: true,
          }
        );
      }
    );
    console.log('result', result);

    return Onsites.countDocuments()
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
    //     date: moment('2020-11-08').utc(),
    //     from: '21h00',
    //     to: '23h00',
    //     note: '',
    //     approved: false,
    //     reason: '',
    //     createdBy: adSeed._id,
    //   },
    // ];
    // return Onsites.create(data);
  }
}

module.exports = OnsitesSeeder;
