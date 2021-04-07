const Onsites = require('../../models/onsite');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const dateConditionOnsites = (start, finish) => {
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
};
const { ERROR } = require('../../utils/error.helper');
class OnsiteControllers {
  async search(req, res) {
    const queryDateConditions = dateConditionOnsites(
      req.body.from,
      req.body.to
    );
    const data = await Onsites.find({
      $and: [
        queryDateConditions,
        {
          employee: ObjectId(req.user.id),
        },
      ],
    });
    res.json({
      status: 200,
      data,
    });
  }
  async add(req, res) {
    try {
      const { ot_date, start, end, project, note, employee } = req.body;
      const convertToDate = new Date(ot_date);
      const momentObj = moment(convertToDate);
      // Create type Date for insert have same UTC in DB
      const momentString = momentObj.format('DD/MM/YYYY'); // 2016-07-15

      await Onsites.create({
        employee: employee ? ObjectId(employee) : req.user.id,
        project: ObjectId(project),
        date: moment(ot_date, 'YYYY MM DD'),
        from: `${momentString} ${start}`,
        to: `${momentString} ${end}`,
        note,
        approved: false,
        reason: '',
        createdBy: req.user.id,
      });
      res.json({
        status: true,
      });
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        error: error.message || 'Have some trouble',
      });
    }
  }
  async update(req, res) {
    try {
      const { ot_date, start, end, project, note, employee } = req.body;
      await Onsites.updateOne(
        {
          $and: [
            { _id: ObjectId(req.params.id) },
            { employee: ObjectId(req.user.id) },
          ],
        },
        {
          employee: employee ? ObjectId(employee) : req.user.id,
          project: ObjectId(project),
          date: moment(ot_date),
          from: start,
          to: end,
          note,
          approved: false,
          reason: '',
          createdBy: req.user.id,
        }
      );
      res.json({
        status: true,
      });
    } catch (error) {
      res.json({
        status: false,
        message: error.message,
      });
    }
  }
  async delete(req, res) {
    try {
      await Onsites.deleteOne({
        $and: [
          { _id: ObjectId(req.params.id) },
          { employee: ObjectId(req.user.id) },
        ],
      });
    } catch (e) {
      res.json({
        status: false,
        message: e.message,
      });
      return;
    }
    res.json({
      status: true,
    });
  }
}
module.exports = OnsiteControllers;
