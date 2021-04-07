const { ObjectId } = require('mongodb');
const Employee = require('../../../../models/employees');
const { ERROR, MESSAGE } = require('../../../../utils/error.helper');
const { v1: uuidv1 } = require('uuid');
// Convert string name. remove tones.
const moment = require('moment');
const {
  removeVietnameseTones,
  querySplitPagination,
} = require('../../../../utils/functionReuse');
const Banks = require('../../../../models/banks');
const EmployeesQuery = require('../query/employees.query');
const banksValidate = require('../../../validate/banksValidate');
const employeesValidate = require('../../../validate/employeesValidate');
const StorageMinio = require('../../../../storage');
// Refactor
class EmployeeController {
  constructor() {
    this.query = new EmployeesQuery();
    this.storage = new StorageMinio();
  }
  async getAllEmployees(req, res) {
    try {
      const { pageSize = 10, pageNo = 1 } = req.query;
      const page = parseInt(pageNo);
      const limit = parseInt(pageSize);
      const data = await Employee.find({}, { password: 0 })
        .skip((page - 1) * limit)
        .limit(limit);
      const total = await Employee.find({}).count();
      return res.json({
        status: ERROR.NO_ERROR,
        data: data,
        message: MESSAGE.SUCCESSFULL,
        total,
      });
    } catch (error) {
      return res.json({
        status: ERROR.UNAUTHEN_ERROR,
        message: error.message || 'Some trouble',
        data: null,
      });
    }
  }
  async searchByOption(req, res) {
    try {
      const { name, state } = req.body;
      const { pageSize = 10, pageNo = 1 } = req.query;
      const nameCompare = removeVietnameseTones(name);
      const query = this.query;
      const pipeline = query.querySearchEmployee(nameCompare, state);
      const getTotalPage = [...pipeline, { $count: 'total' }];
      const total = await Employee.aggregate(getTotalPage);
      const queryGetDataPagination = pipeline.concat(
        querySplitPagination(pageNo, pageSize)
      );
      const dataResponse = await Employee.aggregate(queryGetDataPagination);
      return res.json({
        total: total.length === 0 ? 0 : total[0].total,
        status: ERROR.NO_ERROR,
        data: dataResponse,
      });
    } catch (error) {
      console.log(error);
      return res.json({
        status: ERROR.HANDLE_ERROR,
        error,
        data: null,
      });
    }
  }
  async getUserInfor(req, res) {
    try {
      const { id } = req.params;
      const pipeline = this.query.getEmployeeAndBanksInformation(id);
      const data = await Employee.aggregate(pipeline);
      if (data.length === 0) {
        throw { message: 'Employee not existed in DB' };
      }
      return res.json({
        status: ERROR.NO_ERROR,
        message: "User's  information.",
        data: data[0],
      });
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        error: error.message,
        data: null,
      });
    }
  }
  async createUser(req, res) {
    try {
      req.body.role = 'EM';
      // get email and name from req.body
      const { email, name } = req.body;
      const dataCreateUser = { ...req.body };
      if (dataCreateUser.dob) {
        dataCreateUser.dob = moment(dataCreateUser.dob);
      }
      await employeesValidate.validate(req.body, {
        abortEarly: false,
      });
      const emailExist = await Employee.findOne({ email });
      const slug = removeVietnameseTones(name);
      if (!emailExist) {
        // Email existed?
        const employeeCreate = await Employee.create({
          ...dataCreateUser,
          password: uuidv1(),
          slug: slug,
        });
        delete employeeCreate['password'];
        return res.json({
          status: ERROR.NO_ERROR,
          data: employeeCreate,
          message: MESSAGE.SUCCESSFULL,
        });
      }
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: 'User already exist.',
        data: null,
      });
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.errors || error.message,
        data: null,
      });
    }
  }
  async addBankInfo(req, res) {
    try {
      // Get data from req.body
      const { employeeID, main } = req.body;
      const paymentInformation = { ...req.body };
      // push data to check
      await banksValidate.validate(req.body, {
        abortEarly: false,
      });
      const employee = await Employee.findOne({
        _id: ObjectId(employeeID),
      });
      // Check employee existed?
      if (!employee) {
        return res.json({
          status: ERROR.NOTFOUND_ERROR,
          message: 'Employee not existed.',
        });
      }
      const accountExisting = await Banks.findOne({
        employee: ObjectId(employeeID),
        accNo: req.body.accNo,
      });
      if (accountExisting) {
        throw { message: 'Account existed' };
      }
      if (main === 'true') {
        await Banks.findOneAndUpdate(
          { employee: ObjectId(employeeID), main: true },
          { $set: { main: false } }
        );
      }
      const data = await Banks.insertMany([
        { ...paymentInformation, employee: employeeID },
      ]);
      return res.json({
        status: ERROR.NO_ERROR,
        message: 'Successfull',
        data,
      });
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.errors || error.message,
      });
    }
  }
  async updatePayment(req, res) {
    try {
      const { accNo, main, employeeID } = req.body;
      const dataUpdate = { ...req.body, employee: employeeID };
      const { id } = req.params;
      await banksValidate.validate(req.body, {
        abortEarly: false,
      });
      // Accno existed?
      const checkAccNo = await Banks.findOne({
        accNo: accNo,
      });
      // Get information of this payment ID
      const paymentInfor = await Banks.findOne({
        _id: ObjectId(id),
      });
      if (paymentInfor === null) {
        throw {
          message: 'PaymentID not exist in DB',
        };
      }
      // user had main account
      if (checkAccNo && paymentInfor.accNo !== accNo) {
        throw { message: 'AccNo have existed!' };
      }
      if (main === 'true') {
        // if in new request, this account is main, must set old account main true to false
        await Banks.findOneAndUpdate(
          { _id: ObjectId(id), main: true },
          { $set: { main: false } }
        );
      }
      await Banks.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: { ...dataUpdate } }
      );
      const query = this.query.informationAfterUpdateBanksAccount(id);
      const data = await Banks.aggregate(query);
      // let queryGetDebitInformation = this.query.queryMatchEmployeeInfor
      return res.json({
        status: ERROR.NO_ERROR,
        message: MESSAGE.SUCCESSFULL,
        data,
      });
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        // error.errors is request invalid
        message: error.errors || error.message,
        data: null,
      });
    }
  }
  async updateUserFullInfor(req, res) {
    try {
      const { id } = req.params;
      await employeesValidate.validate(req.body, {
        abortEarly: false,
      });
      const checkDataByEmail = await Employee.findOne({
        email: req.body.email,
      });
      // Check email want to update of employee existed? if not => update.
      if (!checkDataByEmail || checkDataByEmail._id == id) {
        await Employee.findOneAndUpdate(
          { _id: ObjectId(id) },
          {
            $set: req.body,
          }
        );
        const data = await Employee.findOne({ _id: ObjectId(id) });
        if (data === null) {
          throw { message: 'EmployeeID not existed in DB' };
        }
        return res.json({
          status: ERROR.NO_ERROR,
          message: MESSAGE.SUCCESSFULL,
          data,
        });
      } else {
        throw {
          message: 'Email existed',
        };
      }
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        error: error.errors || error.message,
        data: null,
      });
    }
  }
  async deleteUser(req, res) {
    try {
      const { employeeDelete } = req.body;
      if (employeeDelete.length === 0) {
        throw {
          message: 'Nothing to delete.',
        };
      }
      await Promise.all(
        employeeDelete.map(async (employeeId) => {
          //Dete data in ots-onsites-employee table
          await Employee.findOneAndUpdate(
            { _id: ObjectId(employeeId) },
            { $set: { state: 'PENDING' } }
          );
        })
      );
      return res.json({
        status: ERROR.NO_ERROR,
        message: MESSAGE.SUCCESSFULL,
      });
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Some trouble',
      });
    }
  }
  async uploadImage(req, res) {
    try {
      const employeeId = req.params.id;
      const employeeInfor = await Employee.findOne({
        _id: ObjectId(employeeId),
      });
      const minioStorage = this.storage.storage;
      if (employeeInfor) {
        const image = `${employeeId}.png`;
        await Employee.findOneAndUpdate(
          { _id: ObjectId(employeeId) },
          { image: image },
          { new: true }
        );
        await minioStorage.putObject('eps-staging', image, req.file.buffer);
        const data = await minioStorage.presignedUrl(
          'GET',
          'eps-staging',
          image
        );
        return res.json({
          status: ERROR.NO_ERROR,
          data: data,
          message: 'Sucessfull',
        });
      } else {
        throw { message: 'EmployeeID not exist in DB' };
      }
    } catch (error) {
      console.log(
        '🚀 ~ file: employees.controller.js ~ line 370 ~ EmployeeController ~ uploadImage ~ error',
        error
      );
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trouble',
      });
    }
  }
}

module.exports = EmployeeController;
