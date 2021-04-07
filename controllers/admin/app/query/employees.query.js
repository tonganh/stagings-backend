const { ObjectID } = require('mongodb');

class EmployeesQuery {
  querySearchEmployee(nameCompare, stateCompare) {
    return [
      // $name: name field in DB. name is condition user send request
      {
        $match: {
          $expr: {
            $gt: [
              // toupper: to same with type compare. ex: NAM =nam
              { $indexOfCP: ['$slug', nameCompare] },
              -1,
            ],
          },
        },
      },
      // MATH WITH SUBSTRING OF STATE
      {
        $match: {
          $expr: {
            // $state is field in DB. toupper: to same with type compare. ex: DOING===DOING
            $gt: [{ $indexOfCP: [{ $toUpper: '$state' }, stateCompare] }, -1],
          },
        },
      },
      {
        $project: { password: 0 },
      },
    ];
  }
  getEmployeeAndBanksInformation(employeeID) {
    return [
      {
        $match: {
          _id: ObjectID(employeeID),
        },
      },
      // Match employees collection with banks collection. to get Bank's information.
      {
        $lookup: {
          from: 'banks',
          localField: '_id',
          foreignField: 'employee',
          as: 'banksInfo',
        },
      },
      {
        //data response don't have password.
        $project: {
          password: 0,
        },
      },
    ];
  }
  get queryMatchEmployeeInfor() {
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
            $project: { password: 0 },
          },
        ],
        // field joined name is : employeeInfor
        as: 'employeeInfor',
      },
    };
  }
  informationAfterUpdateBanksAccount(accountID) {
    const pipeline = [
      { $match: { _id: ObjectID(accountID) } },
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
              $project: { password: 0 },
            },
          ],
          // field joined name is : employeeInfor
          as: 'employeeInfor',
        },
      },
      { $unwind: { path: '$employeeInfor' } },
    ];
    return pipeline;
  }
}
module.exports = EmployeesQuery;
