const moment = require('moment');
class OtsQuery {
  dateConditionOnsites(start, finish) {
    if (start !== '' && finish !== '') {
      return {
        $and: [
          {
            date: {
              $gte: moment(start)._d,
              $lte: moment(finish)._d,
            },
          },
        ],
      };
    } else if (finish === '') {
      return { date: { $gte: moment(start)._d } };
    } else {
      return { date: { $lte: moment(finish)._d } };
    }
  }
}
module.exports = OtsQuery;
