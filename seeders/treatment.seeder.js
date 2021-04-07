const { Seeder } = require('mongoose-data-seed');
const Employee = require('../models/employees');
const Treatment = require('../models/treatment');

class TreatmentsSeeder extends Seeder {
  async shouldRun() {
    const employeeData = await Employee.find({});
    console.log(
      `🛠 LOG: 🚀 --> ---------------------------------------------------------------------------------------------------------------`
    );
    console.log(
      `🛠 LOG: 🚀 --> ~ file: treatment.seeder.js ~ line 8 ~ TreatmentsSeeder ~ shouldRun ~ employeeData`,
      employeeData
    );
    console.log(
      `🛠 LOG: 🚀 --> ---------------------------------------------------------------------------------------------------------------`
    );
    const dataBase = {
      basicSalary: 1,
      onsiteTreatment: 1,
      otTreatment: 1,
      travelTreatment: 1,
      outsourceSalary: 1,
      phoneTreatment: 1,
      employee: 1,
    };
    // const result = await employeeData.forEach(async (employeeUpdate) => {
    //   dataBase.employee = employeeUpdate._id;
    //   await Treatment.create(dataBase);
    // });
    // console.log('result', result);
    const result = await Promise.all(
      employeeData.map(async (item) => {
        const dataReq = {
          ...dataBase,
          employee: item._id,
        };
        if (item._id !== '') {
          return await Treatment.create(dataReq);
        }
      })
    );
    console.log('result', result);
    return Treatment.countDocuments()
      .exec()
      .then((count) => count === 0);
  }

  async run() {}
}

module.exports = TreatmentsSeeder;
