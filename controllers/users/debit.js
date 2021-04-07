const { ERROR } = require('../../utils/error.helper');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const Debits = require('../../models/debits');
const { validateField } = require('../../utils/app.helper');
const { lastDayInMonth } = require('../../utils/functionReuse');
class DebitControllers {
  async createDebit(req, res) {
    try {
      const { id } = req.user;
      const { amount, content, date, dayWantReceiveMoney } = req.body;
      const { firstDay } = lastDayInMonth(date);
      if (!validateField(amount) || parseInt(amount) <= 0) {
        throw {
          message: 'Amount invalid',
        };
      }
      const debitInit = {
        employee: id,
        amount: amount,
        date: firstDay,
        content: content ? content : '',
        dayWantReceiveMoney: moment(dayWantReceiveMoney, 'YYYY MM DD'),
      };
      await Debits.create(debitInit);
      return res.json({
        status: ERROR.NO_ERROR,
        message: 'Sucessfull',
      });
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trouble',
      });
    }
  }
  async getListDebits(req, res) {
    try {
      var { from, to } = req.body;
      const employeeId = req.user.id;
      var { pageSize, pageNo } = req.query;
      const initObject = {};
      const dateConditions = Object.create(initObject);
      // define pageSize
      if (!validateField(pageSize)) {
        pageSize = 10;
      }
      // define pageNo
      if (!validateField(pageNo)) {
        pageNo = 1;
      }
      const page = parseInt(pageNo);
      const limit = parseInt(pageSize);
      const skip = (page - 1) * limit;
      if (validateField(from)) {
        dateConditions['$gte'] = moment(from)._d;
      }
      if (validateField(to)) {
        dateConditions['$lte'] = moment(to)._d;
      }
      const queryMatchEmployee = { employee: ObjectId(employeeId) };
      if (Object.keys(dateConditions).length !== 0) {
        queryMatchEmployee['date'] = dateConditions;
      }
      const total = await Debits.find(queryMatchEmployee).count();
      const data = await Debits.find(queryMatchEmployee)
        .skip(skip)
        .limit(limit);
      return res.json({
        status: ERROR.NO_ERROR,
        data: data,
        total: total,
      });
    } catch (error) {
      console.log('Error', error);
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trobule',
      });
    }
  }
  async updateDebit(req, res) {
    try {
      const { id } = req.params;
      const { amount, date } = req.body;
      if (!validateField(date)) {
        throw {
          message: 'Required date.',
        };
      }
      const { firstDay } = lastDayInMonth(date);
      if (!validateField(amount) || amount <= 0) {
        throw {
          message: 'Amount invalid',
        };
      }
      const debitExisted = await Debits.findOne({ _id: ObjectId(id) });
      if (debitExisted && debitExisted.status === 'WAIT') {
        const dataUpdate = { ...req.body, date: firstDay };
        await Debits.findOneAndUpdate(
          { _id: ObjectId(id) },
          { $set: { ...dataUpdate } },
          { new: true }
        );
        return res.json({
          status: ERROR.NO_ERROR,
          message: 'Update Successfull',
        });
      } else {
        res.json({
          status: ERROR.HANDLE_ERROR,
          message: `Debit not existed or can't update`,
        });
      }
    } catch (error) {
      console.log('error', error);
      res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trouble',
      });
    }
  }
  async deleteDebit(req, res) {
    try {
      const { id } = req.params;
      const debitWantToDelete = await Debits.findOne({ _id: id });
      if (debitWantToDelete && debitWantToDelete.status === 'WAIT') {
        await Debits.deleteOne({ _id: id });
      } else {
        throw { message: 'Debit not exist or cannot delete.' };
      }
      return res.json({
        status: ERROR.NO_ERROR,
        message: 'Successfull',
      });
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trouble',
      });
    }
  }
}
module.exports = DebitControllers;
