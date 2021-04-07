const Ots = require('../../../../models/ots');
const { ERROR, MESSAGE } = require('../../../../utils/error.helper');
const reUseFunction = require('../../../../utils/functionReuse');
const fs = require('fs');
const {
  querySplitPagination,
  returnConditionsDate,
} = require('../../../../utils/functionReuse');
const Employee = require('../../../../models/employees');
const moment = require('moment');
const {
  formatAmountText,
  workTimeInOneSession,
} = require('../../../../utils/app.helper');
const Treatment = require('../../../../models/treatment');
const xl = require('excel4node');
const { ObjectId } = require('mongodb');
const {
  headerStyles,
  itemStyles,
  totalStyles,
} = require('../styles/ots.styles');
const OtsQuery = require('../query/ots.query');
class OtsController {
  constructor() {
    this.query = new OtsQuery();
  }
  async getAllOts(req, res) {
    try {
      const name = '';
      const { pageSize = 10, pageNo = 1 } = req.query;
      const pipeline = this.query
        .queryGetAll(name)
        .concat(querySplitPagination(pageNo, pageSize));
      const data = await Ots.aggregate(pipeline);
      const total = await Ots.find({}).count();
      return res.json({
        status: ERROR.NO_ERROR,
        data,
        total: total,
      });
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Fail.',
      });
    }
  }
  async searchHaveCondition(req, res) {
    try {
      const { start = '', finish = '', projectId = '', name = '' } = req.body;
      const { pageSize = 10, pageNo = 1 } = req.query;
      const requestName = reUseFunction.removeVietnameseTones(name);
      var arrayToAggregate = this.query.queryGetAll(requestName);
      const queryDateConditions = returnConditionsDate(start, finish);
      if (queryDateConditions !== '') {
        arrayToAggregate.unshift(queryDateConditions);
      }
      if (projectId !== '' && projectId !== undefined) {
        arrayToAggregate.unshift({
          $match: { project: ObjectId(projectId) },
        });
      }
      // Create array
      const total = await Ots.aggregate([
        ...arrayToAggregate,
        {
          $count: 'total',
        },
      ]);
      // Match with page conditions
      const pipeline = arrayToAggregate.concat(
        querySplitPagination(pageNo, pageSize)
      );
      const data = await Ots.aggregate(pipeline);
      // After search, back to first state
      return res.json({
        status: ERROR.NO_ERROR,
        message: MESSAGE.SUCCESSFULL,
        data: data,
        total: total.length > 0 ? total[0].total : 0,
      });
      // if condition not have projectId
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trouble',
      });
    }
  }
  async requestApproval(req, res) {
    try {
      const { id } = req.params;
      const { action = 0, reason } = req.body;
      const updateAction = await Ots.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: { approved: action, reason: reason ? reason : '' } }
      );
      if (updateAction !== null) {
        return res.json({
          status: ERROR.NO_ERROR,
          message: 'Update successfull.',
        });
      }
      throw {
        message: 'OT ID not exist in DB.',
      };
    } catch (error) {
      console.log(`🛠 LOG: 🚀 -->: ----------------------------`);
      console.log(`🛠 LOG: 🚀 -->: error`, error);
      console.log(`🛠 LOG: 🚀 -->: ----------------------------`);
      return res.json({
        status: ERROR.HANDLE_ERROR,
        error: error.message,
      });
    }
  }
  async exportExcel(req, res) {
    try {
      // Create a new instance of a Workbook class
      const wb = new xl.Workbook();
      const columnWidth = 20;
      const style = headerStyles;
      const itemStyle = itemStyles;
      const totalStyle = totalStyles;
      const dashboard = [];
      const employeeData = await Employee.find({});
      const wsDashboard = wb.addWorksheet('Dashboard');
      const path = `${__dirname}/../../../../reports/`;
      const checkFileExisted = await fs.existsSync(path);
      if (!checkFileExisted) {
        await fs.mkdirSync(path);
      }
      await Promise.all(
        employeeData.map(async (item) => {
          const ws = wb.addWorksheet(item.name);
          // Create a reusable style
          ws.column(1).setWidth(columnWidth);
          ws.column(2).setWidth(columnWidth);
          ws.column(3).setWidth(columnWidth);
          ws.column(4).setWidth(columnWidth);
          ws.column(5).setWidth(columnWidth);

          const treatment = await Treatment.find({
            employee: ObjectId(item._id),
          });
          const firstDay = new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 1,
            1
          );
          const lastDay = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            0
          );

          const ownerOts = await Ots.aggregate(
            this.query.queryOts(item, firstDay, lastDay)
          );

          // Set value of cell A1 to employee name as a string type styled with paramaters of style
          ws.cell(1, 1).string('Dự án').style(style);

          // Set value of cell B1 to 200 as a number type styled with paramaters of style
          ws.cell(1, 2).string('Ngày').style(style);

          // Set value of cell C1 to a formula styled with paramaters of style
          ws.cell(1, 3).string('Từ').style(style);

          // Set value of cell A2 to 'sntring' styled with paramaters of style
          ws.cell(1, 4).string('Đến').style(style);

          ws.cell(1, 5).string('Số giờ').style(style);

          ws.cell(1, 6).string('Ghi chú').style(style);

          // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
          let index = 2;
          let sumOfOts = 0;
          if (ownerOts.length) {
            await Promise.all(
              ownerOts.map(async (value) => {
                const project = value.projectInformation;
                const otTime = workTimeInOneSession(value.to, value.from);
                sumOfOts += otTime;
                ws.cell(index, 1).string(project.name).style(itemStyle);

                // Set value of cell B1 to 200 as a number type styled with paramaters of style
                ws.cell(index, 2)
                  .string(moment(new Date(value.date)).format('DD/MM/YYYY'))
                  .style(itemStyle);

                // Set value of cell C1 to a formula styled with paramaters of style
                ws.cell(index, 3)
                  .string(value.from.split(' ')[1])
                  .style(itemStyle);

                ws.cell(index, 4)
                  .string(value.to.split(' ')[1])
                  .style(itemStyle);

                // Set value of cell A2 to 'string' styled with paramaters of style
                ws.cell(index, 5).string(`${otTime}`).style(itemStyle);

                ws.cell(index, 6).string(value.reason).style(itemStyle);
                index++;
              })
            );
            const total = sumOfOts * +treatment[0].onsiteTreatment;
            if (total > 0) {
              dashboard.push({
                employee: item,
                amount: sumOfOts,
                total,
              });
            }
            ws.cell(index, 1).string('Tổng').style(totalStyle);
            ws.cell(index, 5).string(`${sumOfOts}h`).style(totalStyle);
            index++;
            ws.cell(index, 1).string('Tiền phải trả').style(totalStyle);
            ws.cell(index, 2)
              .string(`${formatAmountText(`${total}`)} ₫`)
              .style(totalStyle);
          }
        })
      );

      /**======================
       **   Create Dashboad
       *@param
       *@return type
       *========================**/
      wsDashboard.column(1).setWidth(columnWidth);
      wsDashboard.column(2).setWidth(columnWidth);
      wsDashboard.column(3).setWidth(columnWidth);
      wsDashboard.column(4).setWidth(columnWidth);
      wsDashboard.column(5).setWidth(columnWidth);
      // Set value of cell A1 to employee name as a string type styled with paramaters of style
      wsDashboard.cell(1, 1).string('STT').style(style);

      // Set value of cell B1 to 200 as a number type styled with paramaters of style
      wsDashboard.cell(1, 2).string('Họ tên').style(style);

      // Set value of cell C1 to a formula styled with paramaters of style
      wsDashboard.cell(1, 3).string('Tổng số giờ').style(style);

      // Set value of cell A2 to 'sntring' styled with paramaters of style
      wsDashboard.cell(1, 4).string('Tổng tiền').style(style);

      let index = 2;
      if (dashboard.length) {
        await Promise.all(
          dashboard.map((value, i) => {
            wsDashboard
              .cell(index, 1)
              .number(i + 1)
              .style(itemStyle);

            // Set value of cell B1 to 200 as a number type styled with paramaters of style
            wsDashboard
              .cell(index, 2)
              .string(value.employee.name)
              .style(itemStyle);

            // Set value of cell C1 to a formula styled with paramaters of style
            wsDashboard.cell(index, 3).number(value.amount).style(itemStyle);

            wsDashboard
              .cell(index, 4)
              .string(formatAmountText(value.total))
              .style(itemStyle);

            // Set value of cell A2 to 'string' styled with paramaters of style

            index++;
          })
        );
        /**=======================
         * todo      caculate total payment in this month
         *========================**/
        const total = dashboard.reduce(
          (accumulator, current) => accumulator + current.total,
          0
        );

        wsDashboard.cell(index, 3).string('Tổng').style(totalStyle);
        wsDashboard
          .cell(index, 4)
          .string(formatAmountText(total))
          .style(totalStyle);
      }
      // Add Worksheets to the workbook
      const nameFile = `ot_thang_${
        new Date().getMonth() + 1
      }_nam_${new Date().getFullYear()}.xlsx`;
      wb.write(`reports/${nameFile}`, (err, stats) => {
        if (err) {
          console.error(err);
          return res.json({ status: ERROR.ERROR_LOGIC, messsage: 'fail' });
        } else {
          console.log(stats); // Prints out an instance of a node.js fs.Stats object
          return res.download(
            `${__dirname}/../../../../reports/${nameFile}`,
            `${nameFile}`,
            (err) => {
              console.log(
                '🚀 ~ file: ots.controller.js ~ line 231 ~ OtsController ~ wb.write ~ err',
                err
              );
            }
          );
        }
      });
    } catch (error) {
      console.log(
        `🛠 LOG: 🚀 --> -------------------------------------------------------------------------------------`
      );
      console.log(
        `🛠 LOG: 🚀 --> ~ file: Ots.controller.js ~ line 311 ~ exportExcel: ~ error`,
        error
      );
      console.log(
        `🛠 LOG: 🚀 --> -------------------------------------------------------------------------------------`
      );
    }
  }
}
module.exports = OtsController;
