const { Seeder } = require('mongoose-data-seed');
const Employees = require('../models/employees');
const { removeVietnameseTones } = require('../utils/functionReuse');

const data = [
  {
    isReset: true,
    name: 'Nghiêm Minh Hoàng',
    email: 'hoangnm@hisoft.com.vn',
    password: '$2a$10$Dy3YmCtXcxnBsEf3iOgrP.P9XX016iWOD6uyjDlrT8VBVVNp3Ksqe',
    role: 'EM',
    createdAt: {
      $date: '2020-11-06T17:36:04.341Z',
    },
    updatedAt: {
      $date: '2021-02-19T08:35:34.426Z',
    },
    __v: 0,
    currentLocation: 'ha noi',
    dob: {
      $date: '2020-11-19T17:00:00.000Z',
    },
    hometown: 'thai binh',
    personalEmail: 'hoangnm.dev@gmail.com',
    position: 'PROJECT_MANAGER',
    startWorkAt: {
      $date: '2020-11-19T17:00:00.000Z',
    },
    state: 'DOING',
    phone: '',
  },
];

class EmployeesSeeder extends Seeder {
  async shouldRun() {
    // Get list employee to update
    const listEmployee = await Employees.find({});
    // add 1 field type unsigned char
    await Promise.all(
      await listEmployee.map(async (employee) => {
        const slug = removeVietnameseTones(employee.name);
        const employeeCode = '2';
        await Employees.findOneAndUpdate(
          { _id: employee._id },
          {
            slug: slug,
            employeeCode: employeeCode,
          },
          { new: true }
        );
      })
    );

    // await this.updateFullListEmployees();
    return Employees.countDocuments()
      .exec()
      .then((count) => count === 0);
  }

  async updateFullListEmployees() {
    const state = { state: 'DOING' };
    const result = await Employees.updateMany(
      {},
      { $set: state },
      {
        new: true,
      }
    );
    return result;
  }

  randomProperty(obj) {
    var keys = Object.keys(obj);
    return obj[keys[(keys.length * Math.random()) << 0]];
  }

  async updatePositionEmployee() {
    const position = this.randomProperty({
      EMPLOYEE: 'EMPLOYEE',
      PROJECT_MANAGER: 'PROJECT_MANAGER',
      TEAM_LEAD: 'TEAM_LEAD',
      PARTTIME_EMPLOYEE: 'PARTTIME_EMPLOYEE',
      REMOTE_EMPLOYEE: 'REMOTE_EMPLOYEE',
    });
    console.log(
      `🛠 LOG: 🚀 --> --------------------------------------------------------------------------------------------------------------------`
    );
    console.log(
      `🛠 LOG: 🚀 --> ~ file: employees.seeder.js ~ line 66 ~ EmployeesSeeder ~ updatePositionEmployee ~ position`,
      position
    );
    console.log(
      `🛠 LOG: 🚀 --> --------------------------------------------------------------------------------------------------------------------`
    );

    const result = await Employees.uupdateMany(
      {},
      { $set: { position } },
      {
        new: true,
      }
    );
    return result;
  }

  async run() {
    // return Employees.create(data);
  }
}
module.exports = EmployeesSeeder;
