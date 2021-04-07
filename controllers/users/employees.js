const Employees = require('../..//models/employees');
var ObjectID = require('mongodb').ObjectID;
const { ERROR } = require('../../utils/error.helper');
const Banks = require('../../models/banks');
const moment = require('moment');
const banksValidate = require('../validate/banksValidate');
const accessKey = process.env.MINIO_ACCESS_KEY;
const secretKey = process.env.MINIO_ACCESS_SECERETKEY;
const Minio = require('minio');
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_URL,
  // port: 9000,
  useSSL: true,
  accessKey: accessKey,
  secretKey: secretKey,
});
class Employeecontrollers {
  async create(req, res) {
    Employees.create({
      name: 'Nghiêm Minh Hoàng',
      email: 'hoangnm@hisoft.com.vn',
      password: '123123123',
      role: 'AD',
    });
  }
  async salary(req, res) {
    const emps = await Employees.find({});
    const mock = {
      name: 'Nguyen van a',
      email: 'a@demo.com',
      role: 'DEV',
      bank: {
        accNo: '123123123',
        name: 'TECHCOMBANK',
        accName: 'Nguyen Van a',
        branch: 'Ba Dinh',
      },
      baseSalary: 20000000,
      otSalary: 1000000,
      benefit: {
        onsite: 100000,
        vehicle: 150000,
        mobile: 0,
        transport: 0,
      },
      prePaid: 300000,
      amout: 25000000,
      note: 'OK',
      status: 'PAID',
    };
    const empsSalary = emps.map((e) => {
      return {
        name: e.name,
        email: e.email,
        role: e.role,
        ...mock,
      };
    });

    res.json(empsSalary);
  }
  async getUserInfor(req, res) {
    try {
      const getUserData = await Employees.aggregate([
        {
          $match: {
            _id: ObjectID(req.params.id),
          },
        },
        // Match employees collection with banks collection. to get Bank's information.
        {
          $lookup: {
            from: 'banks',
            localField: '_id',
            foreignField: 'employee',
            as: 'banksInfo',
          },
        },
        {
          //data response don't have password.
          $project: {
            password: 0,
          },
        },
      ]);
      if (!getUserData.length) {
        throw { message: 'Employee not exist in DB' };
      }
      let imgAddress = '';
      if (getUserData[0].image !== '') {
        imgAddress = await minioClient.presignedUrl(
          'GET',
          'eps-staging',
          getUserData[0].image
        );
      }
      const data = { ...getUserData[0], image: imgAddress };
      res.json({
        status: ERROR.NO_ERROR,
        message: "User's  information.",
        data: data,
      });
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        error: error,
      });
    }
  }
  async updateUserInfor(req, res) {
    Object.assign(req.body, { updatedAt: Date() });
    if (req.body.email !== '') {
      const findUser = await Employees.findOne({ _id: req.user.id });
      if (findUser) {
        try {
          // Create password by bcrypt.
          // salt work factor in .env
          // const dob = await moment(req.body.dob);
          const dob = moment(req.body.dob);
          const startWorkAt = moment(req.body.startWorkAt);
          await Employees.updateOne(
            {
              email: findUser.email,
            },
            {
              $set: { ...req.body, dob, startWorkAt },
            }
          );
          return res.json({
            status: ERROR.NO_ERROR,
            message: 'Update successfull.',
          });
        } catch (error) {
          res.json({
            status: ERROR.HANDLE_ERROR,
            message: "Can't not match.",
          });
        }
      }
      return res.json({
        status: ERROR.ERROR_LOGIC,
        message: 'User is not existed in databse.',
      });
    }
  }
  async addPaymentInformation(req, res) {
    try {
      await banksValidate.validate(req.body, {
        abortEarly: false,
      });
      const dataBanks = await Banks.find({
        employee: ObjectID(req.user.id),
      });
      if (dataBanks.length === 0) {
        const dataAdd = { ...req.body, main: true, employee: req.user.id };
        Banks.insertMany([{ ...dataAdd }]);
        return res.json({
          status: ERROR.NO_ERROR,
          message: 'Successfull.',
        });
      }
      const checkMain = await dataBanks.find(
        (banksDocument) => banksDocument.main === true
      );
      const checkAccNo = await dataBanks.find(
        (banksDocument) => banksDocument.accNo === req.body.accNo
      );
      if (checkAccNo) {
        res.json({
          status: ERROR.HANDLE_ERROR,
          message: 'Account number has existed.',
        });
      } else {
        if (checkMain) {
          await Object.assign(req.body, { main: false });
          const dataAdd = { ...req.body, employee: req.user.id };
          Banks.insertMany([{ ...dataAdd }]);
          return res.json({
            status: ERROR.NO_ERROR,
            message: 'Successfull.',
          });
        } else {
          const dataAdd = { ...req.body, main: true, employee: req.user.id };
          Banks.insertMany([{ ...dataAdd }]);
          return res.json({
            status: ERROR.NO_ERROR,
            message: 'Successfull.',
          });
        }
      }
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        error: error.errors || error.message,
      });
    }
  }
  async updatePayment(req, res) {
    // Get id of payment ID.
    try {
      const updateData = {};
      const { accNo, paymentBankId } = req.body;
      await banksValidate.validate(req.body, {
        abortEarly: false,
      });
      const checkAccNo = await Banks.findOne({
        accNo: accNo,
      });
      // Id is _id of employee in banks table.
      // If accNo have existed and accNo after find not equal not req.body.accNo. That's mean the accNo invalid.
      // Type of checkAccNo(if existed) is object.
      const paymentInfor = await Banks.findOne({ _id: Object(paymentBankId) });
      //Check update with paymentId. If not change accNo => confirm update.
      if (checkAccNo && paymentInfor.accNo !== accNo) {
        return res.json({
          error: ERROR.HANDLE_ERROR,
          message: 'AccNo have existed!',
        });
      } else {
        const updatePayment = await Banks.findOneAndUpdate(
          {
            _id: ObjectID(paymentBankId),
          },
          {
            $set: updateData,
          },
          {
            new: true,
          }
        );
        if (!updatePayment) {
          throw {
            message: 'Payment ID is not exists.',
          };
        }
        return res.json({
          status: ERROR.NO_ERROR,
          message: 'Successfull.',
        });
      }
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Some trouble.',
      });
    }
  }
}
module.exports = Employeecontrollers;
