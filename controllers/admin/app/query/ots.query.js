const { ObjectId } = require('mongodb');
class OtsQuery {
  queryGetAll(name) {
    return [
      {
        $lookup: {
          from: 'employees',
          let: {
            employee: '$employee',
            date: '$date',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$employee'],
                },
              },
            },
            {
              $match: {
                $expr: {
                  $gt: [
                    {
                      $indexOfCP: ['$slug', name],
                    },
                    -1.0,
                  ],
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
      {
        // JOin with Ots data with projects data(get  projectName)
        $lookup: {
          from: 'projects',
          let: { project: '$project' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      // Match to get information of project.
                      $eq: ['$_id', '$$project'],
                    },
                  ],
                },
              },
            },
            {
              // Data response not need members and createdAt in projectDAta.
              $project: { members: 0, createdAt: 0, __v: 0 },
            },
          ],
          as: 'project',
        },
      },
      {
        $unwind: {
          path: '$employee',
        },
      },
      {
        $unwind: {
          path: '$project',
        },
      },
    ];
  }
  matchForExportExcel(id) {
    return [
      {
        $match: {
          $expr: {
            $eq: ['$employee', ObjectId(id)],
          },
        },
      },
      {
        $lookup: {
          from: 'projects',
          let: { projectID: '$project' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$projectID'],
                },
              },
            },
            {
              $project: { createdAt: 0, updatedAt: 0, __v: 0, member: 0 },
            },
          ],
          as: 'projectInformation',
        },
      },
      { $unwind: '$projectInformation' },
    ];
  }
  queryOts(item, firstDay, lastDay) {
    return [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ['$employee', ObjectId(item._id)],
              },
              {
                $gte: ['$date', firstDay],
              },
              {
                $lte: ['$date', lastDay],
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'projects',
          let: { projectID: '$project' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$projectID'],
                },
              },
            },
            {
              $project: { createdAt: 0, updatedAt: 0, __v: 0, member: 0 },
            },
          ],
          as: 'projectInformation',
        },
      },
      { $unwind: '$projectInformation' },
    ];
  }
}
module.exports = OtsQuery;
