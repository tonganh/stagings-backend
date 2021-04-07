const { ObjectID } = require('mongodb');
class TreatmentsQuery {
  detailPayment(employeeID) {
    return [
      {
        $match: {
          // $eq: {  },
          employee: ObjectID(employeeID),
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'employees',
          let: { employee: '$employee' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$employee'] } } },
            {
              $project: {
                name: 1,
                _id: 1,
              },
            },
          ],
          as: 'employee',
        },
      },
    ];
  }
}
module.exports = TreatmentsQuery;
