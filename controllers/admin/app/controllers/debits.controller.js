const { ObjectID } = require('mongodb');
const Debits = require('../../../../models/debits');
const { ERROR } = require('../../../../utils/error.helper');
const { querySplitPagination } = require('../../../../utils/functionReuse');
let QueryDebits = require('../query/debits.query');
class DebitsController {
  constructor() {
    this.query = new QueryDebits();
  }
  async requestApproval(req, res) {
    try {
      // get DebitID in from req
      const { id } = req.params;
      const dataUpdate = { ...req.body };
      const query = this.query;
      const pipeline = query.joinDebitAndEmployeeInformation(id);
      await Debits.findOneAndUpdate({ _id: ObjectID(id) }, { ...dataUpdate });
      const data = await Debits.aggregate(pipeline);
      if (data.length === 0) {
        throw { message: 'DebitID not exsited in DB' };
      }
      return res.json({
        status: ERROR.NO_ERROR,
        message: 'Successfull',
        data: data,
      });
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trouble',
        data: null,
      });
    }
  }
  async getAllDebits(req, res) {
    try {
      const { pageSize = 10, pageNo = 1 } = req.query;
      // Match with employee information
      const query = this.query;
      const pipeline = query.joinAllDebitAndEmployee;
      pipeline.concat(querySplitPagination(pageNo, pageSize));
      // split pagination
      const total = await Debits.find().count();
      const data = await Debits.aggregate(pipeline);
      return res.json({
        status: ERROR.NO_ERROR,
        data: data,
        total: total,
      });
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trouble',
        data: null,
      });
    }
  }
  async searchAllDebits(req, res) {
    try {
      const { pageSize = 10, pageNo = 1 } = req.query;
      let { name, from, to, status } = req.body;
      const query = this.query;
      const getAllDebitsDocuments = query.searchDebits(name, from, to, status);
      const queryGetTotalData = [...getAllDebitsDocuments, { $count: 'total' }];
      const total = await Debits.aggregate(queryGetTotalData);
      const queryGetDataSplitPagination = getAllDebitsDocuments.concat(
        querySplitPagination(pageNo, pageSize)
      );
      const data = await Debits.aggregate(queryGetDataSplitPagination);

      return res.json({
        status: ERROR.NO_ERROR,
        data,
        total: total.length === 0 ? 0 : total[0].total,
      });
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trouble',
        data: null,
      });
    }
  }
}
module.exports = DebitsController;
