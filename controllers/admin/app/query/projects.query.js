const EmployeesQuery = require('./employees.query');
const moment = require('moment');

class ProjectsQuery extends EmployeesQuery {
  get matchEmployeeInProject() {
    return {
      $lookup: {
        from: 'employees',
        let: { membersInformation: '$members' },
        pipeline: [
          {
            $match: {
              $expr: {
                //  members in project's document is an array. so we must use "in". That's mean: EmployeeID in members's  Array
                // , if value in employee collection. that will in res
                $in: ['$_id', '$$membersInformation'],
              },
            },
          },
          {
            // Data response in project not need members in project and createdAt, __v
            $project: { name: 1, _id: 1 },
          },
        ],
        as: 'members',
      },
    };
  }
  dateConditionsProject(projectStart, projectEnd) {
    const start = projectStart;
    const end = projectEnd;
    if (start !== '' && end !== '') {
      return {
        $and: [
          {
            start: { $gte: moment(start)._d },
          },
          {
            end: { $lte: moment(end)._d },
          },
        ],
      };
    } else if (end === '') {
      return { start: { $gte: moment(start)._d } };
    } else if (start === '') {
      return { end: { $lte: moment(end)._d } };
    } else {
      return '';
    }
  }
  matchProjectHaveConditions(nameProject, state, dateConditions) {
    const matchProjectAndEmployee = this.matchEmployeeInProject;
    return [
      // MATH WITH SUBSTRING OF nameProject
      {
        $match: {
          $expr: { $gt: [{ $indexOfCP: ['$slug', nameProject] }, -1] },
        },
      },
      // MATH WITH SUBSTRING OF STATE
      { $match: { $expr: { $gt: [{ $indexOfCP: ['$state', state] }, -1] } } },
      matchProjectAndEmployee,
      {
        // match date conditions.
        $match: dateConditions,
      },
    ];
  }
  queryGetAllProjects(nameProject, state) {
    const matchProjectAndEmployee = this.matchEmployeeInProject;
    return [
      // MATH WITH SUBSTRING OF nameProject
      {
        $match: {
          // Lowercase feel nameProject, and compare with nameProject request.
          $expr: {
            $gt: [{ $indexOfCP: ['$slug', nameProject] }, -1],
          },
        },
      },
      // MATH WITH SUBSTRING OF STATE
      { $match: { $expr: { $gt: [{ $indexOfCP: ['$state', state] }, -1] } } },
      matchProjectAndEmployee,
    ];
  }
}
module.exports = ProjectsQuery;
