const {
  removeVietnameseTones,
  returnConditionsDate,
} = require('../../../../utils/functionReuse');
const { ObjectID } = require('mongodb');
const EmployeesQuery = require('./employees.query');

class DebitsQuery extends EmployeesQuery {
  searchDebits(name, from, to, status) {
    let start = from;
    let finish = to;
    let nameEmployee;
    name === undefined ? (nameEmployee = '') : (nameEmployee = name);
    if (nameEmployee !== '') {
      nameEmployee = removeVietnameseTones(nameEmployee);
      console.log(
        '🚀 ~ file: debits.query.js ~ line 15 ~ DebitsQuery ~ searchDebits ~ nameEmployee',
        nameEmployee
      );
    }
    if (start === undefined) {
      start = '';
    }
    if (finish === undefined) {
      finish = '';
    }
    const dateConditions = returnConditionsDate(start, finish);
    const pipeline = [
      { $match: { $expr: { $gt: [{ $indexOfCP: ['$status', status] }, -1] } } },
      {
        $lookup: {
          from: 'employees',
          let: {
            employee: '$employee',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $gt: [
                    {
                      $indexOfCP: ['$slug', nameEmployee],
                    },
                    -1.0,
                  ],
                },
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$employee'],
                },
              },
            },
            {
              $project: {
                name: 1.0,
                _id: 1.0,
              },
            },
          ],
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee' } },
    ];
    if (dateConditions !== '') {
      pipeline.unshift(dateConditions);
    }
    return pipeline;
  }
  get matchDebitsAndEmployees() {
    return {
      $lookup: {
        from: 'employees',
        let: {
          employee: '$employee',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                // lookup with id employee
                $eq: ['$_id', '$$employee'],
              },
            },
          },
          {
            $project: { _id: 1, name: 1 },
          },
        ],
        // field joined name is : employeeInfor
        as: 'employee',
      },
    };
  }
  joinDebitAndEmployeeInformation(id) {
    return [
      {
        $match: {
          $expr: {
            $eq: ['$_id', ObjectID(id)],
          },
        },
      },
      {
        $lookup: {
          from: 'employees',
          let: {
            employee: '$employee',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  // lookup with id employee
                  $eq: ['$_id', '$$employee'],
                },
              },
            },
            {
              $project: { _id: 1, name: 1 },
            },
          ],
          // field joined name is : employeeInfor
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee' } },
    ];
  }
  get joinAllDebitAndEmployee() {
    return [
      {
        $lookup: {
          from: 'employees',
          let: {
            employee: '$employee',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  // lookup with id employee
                  $eq: ['$_id', '$$employee'],
                },
              },
            },
            {
              $project: { _id: 1, name: 1 },
            },
          ],
          // field joined name is : employeeInfor
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee' } },
    ];
  }
}
module.exports = DebitsQuery;
