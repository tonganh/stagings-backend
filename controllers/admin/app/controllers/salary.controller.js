/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
const { ObjectId } = require('mongodb');
const Salaries = require('../../../../models/salaries.model');
const { ERROR, MESSAGE } = require('../../../../utils/error.helper');
const { workTimeInOneSession } = require('../../../../utils/app.helper');

const {
  lastDayInMonth,
  querySplitPagination,
} = require('../../../../utils/functionReuse');
const moment = require('moment');
const Employee = require('../../../../models/employees');
const SalariesQuery = require('../query/salary.query');
// convert to string DB can accept value and search

class SalaryControllers {
  constructor() {
    this.query = new SalariesQuery();
  }
  async caculateSalaries(req, res) {
    /**
     * 1, kiểm tra tháng search với tháng hiện tại.  Nếu tháng đang tìm kiếm lớn hơn tháng hiện tại => không cho tính
     * 2, Duyệt các bản ghi trong tháng cần tính. Nếu đã trạng thái "Đã xác nhận" thì không xóa mà giữ nguyên.
     * 3, Lấy dữ liệu dữ liệu mới nhất của nhân viên, gồm có: thông tin đãi ngộ, tổng giờ OT, ngày onsite, tiền tạm ứng trong tháng đó
     * select bảng employee, join với bảng treatment(treatment.employee = employee._id), sort theo createdAt theo thứ tự giảm dần, lấy bản ghi đầu tiên.
     * Tiếp tục join với bảng ot/onsite(employee._id == ot/onsite.employee ). Filter theo điều kiện ot/onsite.date thuộc tháng mà cần tính lương.
     * Join với bảng debits (employee._id == debits.employee). Filter theo điều kiện date thuộc tháng cần tính lương và đã xác nhận chuyển tiền
     * 4, tính tổng thời gian ot, ngày onsite, tổng tiền đã tạm ứng.
     *Trong trường hợp tính lỗi tổng số thời gian ot - onsite, sẽ lưu vào trong DB với giá trị 0. Trường calculate có giá trị false.
     *Nếu tính thành công (tổng thời gian ot-onsite không lỗi - ví dụ như NaN). Trường calculated có giá trị true.
     * Lưu salary(ot, ónite, debit) vào db
     *  * 5, Thông báo đã tạo bảng lương thành công.
     */

    try {
      // Get time(hours). Input examle: 8:00 - 9:00
      // query lookup - match in current month
      const monthSearch = req.params.month;
      // const { month } = req.params;
      // get lastday, firstDay in month client suggest
      const { lastDay, firstDay } = lastDayInMonth(monthSearch);
      // get last day of current month
      const today = new Date();

      if (lastDay.getTime() > today.getTime()) {
        throw {
          message: "Can't calculate salary for this month.",
        };
      }
      const conditionMonth = [
        { $match: { month: monthSearch, state: true } },
        { $project: { employee: 1 } },
      ];
      const approvedSalariesDocument = await Salaries.aggregate(conditionMonth);
      // get list employeeID No need to calculate the salary for the employees whose admin has confirmed the salary before.
      const listEmployeeNotNeedCalculated = approvedSalariesDocument.map(
        (document) => {
          return ObjectId(document.employee);
        }
      );
      await Salaries.deleteMany({ month: monthSearch, state: false });
      // Get listEmployee, have information of OT-Onsite-Treatment in that month
      const listEmployee = await Employee.aggregate(
        this.query.matchDataToCalculate(
          firstDay,
          lastDay,
          listEmployeeNotNeedCalculated
        )
      );
      // employee cannot caculate salaries
      const errorEmployee = [];
      const salaryInit = {
        ot: 0,
        month: monthSearch,
        advancePayment: 0,
        onsite: 0,
        state: false,
        start: firstDay,
        end: lastDay,
        paidDate: '',
        note: '',
      };
      await Promise.all(
        listEmployee.map(async (employee) => {
          // get _id of employee
          const { _id } = employee.treatmentInformation;
          const employeeID = employee._id;
          // get total hour of employee when OT
          const sumOfOt = employee.timeOT.reduce(
            (sum, currentValue) =>
              sum + workTimeInOneSession(currentValue.to, currentValue.from),
            0
          );
          const totalMoneyDebits = employee.debitsData.reduce(
            (sum, currentValue) => sum + currentValue.amount,
            0
          );
          // total day onsite.
          const sumOfOnsites = employee.timeOnsites.length;
          const error = [];
          // const { isReset, name, email, role, state, position } = employee;
          if (isNaN(sumOfOt) || sumOfOt < 0) {
            errorEmployee.push(employeeID);
            error.push('Total hour Ot invalid');
          }
          if (isNaN(sumOfOnsites) || sumOfOnsites < 0) {
            if (!errorEmployee.includes(employeeID)) {
              errorEmployee.push(employeeID);
            }
            error.push('Total hour Onsites invalid');
          }
          const dataInsert = {
            ...salaryInit,
            employee: employee._id,
            ot: isNaN(sumOfOt) ? 0 : sumOfOt,
            onsite: isNaN(sumOfOnsites) ? 0 : sumOfOnsites,
            treatmentID: _id,
            error,
            advancePayment: totalMoneyDebits,
          };
          await Salaries.create(dataInsert);
        })
      );
      if (errorEmployee.length === 0) {
        return res.json({
          status: ERROR.NO_ERROR,
          message: 'Update Successfull.',
          // data: allSalaryDocument,
        });
      } else {
        return res.json({
          status: ERROR.NO_ERROR,
          message: 'Update fail',
          error: errorEmployee,
        });
      }
    } catch (error) {
      console.log('error', error.message);
      res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Fail.',
      });
    }
  }
  async updateSalary(req, res) {
    try {
      const { salaryID } = req.params;
      const { state = false, note = '' } = req.body;
      const datdaUpdate = { state, note };
      const checkApproved = await Salaries.findOne({ _id: ObjectId(salaryID) });
      if (checkApproved.state === true) {
        throw {
          message: 'Approved.  Cannot edit note.',
        };
      }
      if (state === true) {
        Object.assign(datdaUpdate, { paidDate: moment() });
      }
      const updateSalariesState = await Salaries.findOneAndUpdate(
        {
          _id: ObjectId(salaryID),
        },
        {
          $set: datdaUpdate,
        }
      );
      if (!updateSalariesState) {
        throw { message: 'Have some trouble' };
      } else {
        return res.json({
          status: ERROR.NO_ERROR,
          message: 'Successfull.',
        });
      }
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Fail.',
      });
    }
  }
  async search(req, res) {
    try {
      const { month } = req.params;
      const { pageSize = 10, pageNo = 1 } = req.query;
      const queryGetAllEmployee = this.query.dataOfEmployee;
      const querySplitPage = querySplitPagination(pageNo, pageSize);
      const queryGetDataAndSplitPage = queryGetAllEmployee.concat(
        querySplitPage
      );
      const listTags = ['1', '2', '3', '4'];
      const searchResult = await Salaries.aggregate(
        this.query.monthConditions(month).concat(queryGetDataAndSplitPage)
      );
      const totalDocument = await Salaries.find({ month: month }).count();
      const dataResponse = searchResult.map((salariesInformation) => {
        const { advancePayment, ot, onsite } = salariesInformation;
        const {
          basicSalary,
          onsiteTreatment,
          otTreatment,
          travelTreatment,
          phoneTreatment,
        } = salariesInformation.treatmentInformation;
        const subsidize = travelTreatment + phoneTreatment;
        const costOts = otTreatment * ot;
        const costOnsites = onsiteTreatment * onsite;
        const total = basicSalary + subsidize + costOts + costOnsites;
        const moneyMustSend = total - advancePayment;
        const dataHaveMoneyMustSend = {
          ...salariesInformation,
          ot: {
            total: ot,
            cost: costOts,
          },
          onsite: {
            total: onsite,
            cost: costOnsites,
          },
          moneyMustSend,
          subsidize,
          treatmentInformation:
            // If match have value, just get first value becuase one treatmentInforamtion just have 1 employee
            salariesInformation.treatmentInformation
              ? salariesInformation.treatmentInformation
              : null,
        };
        return dataHaveMoneyMustSend;
      });
      return res.json({
        status: ERROR.NO_ERROR,
        total: totalDocument,
        data: dataResponse,
        listTags: listTags,
      });
    } catch (error) {
      console.log('err', error);
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Fail.',
      });
    }
  }
  async filter(req, res) {
    try {
      const { tags = [] } = req.body;
      let tagsConditions;
      if (tags.length !== 0) {
        tagsConditions = tags.map((tag) => {
          return { $expr: { $gt: [{ $indexOfCP: ['$tags', tag] }, -1] } };
        });
      }
      const { month } = req.params;
      const { pageSize = 10, pageNo = 1 } = req.query;
      const queryGetAllEmployee = this.query.dataOfEmployee;
      const querySplitPage = querySplitPagination(pageNo, pageSize);
      const queryGetDataAndSplitPage = queryGetAllEmployee.concat(
        querySplitPage
      );
      const query = this.query
        .monthConditions(month)
        .concat(queryGetDataAndSplitPage);
      if (tags.length !== 0) {
        query.push({ $match: { $and: tagsConditions } });
      }
      query.concat(queryGetDataAndSplitPage);
      const searchResult = await Salaries.aggregate(query);
      query.push({ $count: 'total' });
      const totalData = await Salaries.aggregate(query);
      if (totalData.length !== 0) {
        searchResult.map((salariesInformation) => {
          const { advancePayment, ot, onsite } = salariesInformation;
          const {
            basicSalary,
            onsiteTreatment,
            otTreatment,
            travelTreatment,
            phoneTreatment,
          } = salariesInformation.treatmentInformation;
          const subsidize = travelTreatment + phoneTreatment;
          const costOts = otTreatment * ot;
          const costOnsites = onsiteTreatment * onsite;
          const total = basicSalary + subsidize + costOts + costOnsites;
          const moneyMustSend = total - advancePayment;
          const dataHaveMoneyMustSend = {
            ...salariesInformation,
            ot: {
              total: ot,
              cost: costOts,
            },
            onsite: {
              total: onsite,
              cost: costOnsites,
            },
            moneyMustSend,
            subsidize,
            treatmentInformation:
              // If match have value, just get first value becuase one treatmentInforamtion just have 1 employee
              salariesInformation.treatmentInformation
                ? salariesInformation.treatmentInformation
                : null,
          };
          return dataHaveMoneyMustSend;
        });
      }
      return res.json({
        status: ERROR.NO_ERROR,
        message: MESSAGE.SUCCESSFULL,
        total: totalData.length === 0 ? 0 : totalData[0].total,
        data: searchResult,
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: salary.controller.js ~ line 315 ~ SalaryControllers ~ filter ~ error',
        error
      );
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trouble',
      });
    }
  }
  async getDetailError(req, res) {
    try {
      const { id } = req.params;
      const query = [{ $match: { _id: ObjectId(id) } }];
      query.concat(this.query.dataOfEmployee);
      const data = await Salaries.aggregate(query);
      return res.json({
        status: ERROR.NO_ERROR,
        data: data,
      });
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trouble',
      });
    }
  }
}
module.exports = SalaryControllers;
