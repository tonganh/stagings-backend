const Ots = require('../../models/ots');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const OtsQuery = require('./query/ots.query');
const Query = new OtsQuery();
class OtControllers {
  async search(req, res) {
    let { from, to } = req.body;
    if (from === undefined) {
      from = '';
    }
    if (to === undefined) {
      to = '';
    }
    const queryDateConditions = await Query.dateConditionOnsites(from, to);
    let pipeline = {
      $and: [
        queryDateConditions,
        {
          employee: ObjectId(req.user.id),
        },
      ],
    };
    const data = await Ots.find(pipeline);
    res.json({
      status: 200,
      data: data,
    });
  }
  async add(req, res) {
    try {
      const { ot_date, start, end, ship, project, note, employee } = req.body;
      const date = moment(ot_date, 'YYYY MM DD');
      await Ots.create({
        employee: employee ? ObjectId(employee) : req.user.id,
        project: ObjectId(project),
        ship,
        date: date,
        from: start,
        to: end,
        note,
        approved: false,
        reason: '',
        createdBy: req.user.id,
      });
      res.json({
        status: true,
      });
    } catch (error) {
      console.log('err', error);
    }
  }
  async update(req, res) {
    try {
      const { ot_date, start, end, ship, project, note, employee } = req.body;
      await Ots.updateOne(
        {
          $and: [
            { _id: ObjectId(req.params.id) },
            { employee: ObjectId(req.user.id) },
          ],
        },
        {
          employee: employee ? ObjectId(employee) : req.user.id,
          project: ObjectId(project),
          ship,
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
      await Ots.deleteOne({
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
module.exports = OtControllers;
