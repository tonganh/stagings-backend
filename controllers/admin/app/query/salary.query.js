class SalariesQuery {
  // Mathc OT-Onsites table to get total data in month. And match some information of employee(etc :banks, name,)
  get dataOfEmployee() {
    return [
      {
        $lookup: {
          from: 'employees',
          let: { id: '$employee' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            {
              $project: {
                name: 1,
                email: 1,
                role: 1,
                position: 1,
                employeeCode: 1,
              },
            },
          ],
          as: 'userDetail',
        },
      },
      {
        $unwind: '$userDetail',
      },
      {
        $sort: { 'userDetail.employeeCode': 1 },
      },
      {
        $lookup: {
          from: 'banks',
          let: { employee: '$employee' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$employee', '$$employee'] },
              },
            },
            { $project: { accName: 1, accNumber: 1, main: 1 } },
          ],
          // Bank information. ex: account number and account name.
          as: 'banksInformation',
        },
      },
      {
        $lookup: {
          from: 'treatments',
          let: { employee: '$employee' },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee', '$$employee'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'treatmentInformation',
        },
      },
      {
        $unwind: '$treatmentInformation',
      },
    ];
  }
  monthConditions(month) {
    return [
      {
        $match: { $expr: { $eq: ['$month', month] } },
      },
    ];
  }
  matchDataToCalculate(from, to, listEmployeeNotNeedCalculated) {
    return [
      {
        $match: { _id: { $nin: listEmployeeNotNeedCalculated } },
      },
      { $match: { state: 'DOING' } },
      // match with treatments table
      {
        $lookup: {
          from: 'treatments',
          let: { employee: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee', '$$employee'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'treatmentInformation',
        },
      },
      // convert to object
      {
        $unwind: '$treatmentInformation',
      },
      // match data OTS is this month.
      {
        $lookup: {
          from: 'ots',
          let: { employee: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    // match employee
                    { $eq: ['$employee', '$$employee'] },
                    // in time range
                    { $gte: ['$date', from] },
                    { $lte: ['$date', to] },
                    // Ot accepted?
                    { $eq: ['$approved', 1] },
                  ],
                },
              },
            },
            { $project: { from: 1, to: 1, approved: 1 } },
          ],
          as: 'timeOT',
        },
      },
      // match data onsites is this month.
      {
        $lookup: {
          from: 'onsites',
          let: { employee: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    // match employee ID
                    { $eq: ['$employee', '$$employee'] },
                    // Match in timerange
                    { $gte: ['$date', from] },
                    { $lte: ['$date', to] },
                    // Accept Onsites from admin?
                    { $eq: ['$approved', 1] },
                  ],
                },
              },
            },
            { $project: { from: 1, to: 1, approved: 1 } },
          ],
          as: 'timeOnsites',
        },
      },
      // match data in debits table
      {
        $lookup: {
          from: 'debits',
          let: { employee: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    // match employee
                    { $eq: ['$employee', '$$employee'] },
                    // in time range
                    { $gte: ['$time', from] },
                    { $lte: ['$time', to] },
                    // This debits approval
                    { $eq: ['$status', 'APPROVAL'] },
                  ],
                },
              },
            },
            { $project: { times: 1, status: 1, amount: 1, employee: 1 } },
          ],
          as: 'debitsData',
        },
      },
      // { $unwind: '$debitsData' },
      // {
      //   $group: {
      //     _id: '$debitsData.employee',
      //     totalAmountOfEmployee: {
      //       $sum: '$amount',
      //     },
      //   },
      // },
    ];
  }
}
module.exports = SalariesQuery;
