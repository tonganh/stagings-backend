const Onsites = require('../../../../models/onsite');
const { ERROR, MESSAGE } = require('../../../../utils/error.helper');
const reUseFunction = require('../../../../utils/functionReuse');
const moment = require('moment');
const xl = require('excel4node');
const { ObjectId } = require('mongodb');
const {
  querySplitPagination,
  returnConditionsDate,
} = require('../../../../utils/functionReuse');
const Employee = require('../../../../models/employees');
const { formatAmountText } = require('../../../../utils/app.helper');
const Treatment = require('../../../../models/treatment');
const {
  headerStyles,
  itemStyles,
  totalStyles,
} = require('../styles/onsites.styles');
const OnsitesQuery = require('../query/onsites.query');
class OnsitesControllers {
  constructor() {
    this.query = new OnsitesQuery();
  }
  async getAllOnsites(req, res) {
    try {
      // name of employee
      const { pageSize = 10, pageNo = 1 } = req.query;
      const querySplitPaginatoin = querySplitPagination(pageNo, pageSize);
      const getAllOnsitesDocuments = this.query.queryGetAll('');
      const queryHavePagination = getAllOnsitesDocuments.concat(
        querySplitPaginatoin
      );
      const data = await Onsites.aggregate(queryHavePagination);
      const total = await Onsites.find({}).count();
      res.json({
        status: ERROR.NO_ERROR,
        message: MESSAGE.SUCCESSFULL,
        data: data,
        total: total,
      });
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        data: null,
        message: error.message || 'Fail.',
      });
    }
  }
  async searchHaveConditions(req, res) {
    try {
      const { start, finish, projectId, name = '' } = req.body;
      const { pageSize = 10, pageNo = 1 } = req.query;
      const requestName = reUseFunction.removeVietnameseTones(name);
      let pipeline = this.query.queryGetAll(requestName);
      const queryDateConditions = returnConditionsDate(start, finish);
      if (queryDateConditions !== '') {
        pipeline.unshift(queryDateConditions);
      }
      if (projectId !== '' && projectId !== undefined) {
        pipeline.unshift({
          $match: { project: ObjectId(projectId) },
        });
      }
      const total = await Onsites.aggregate([...pipeline, { $count: 'total' }]);
      // query get data and split pagiantion
      const queryGetDataHavePagination = pipeline.concat(
        querySplitPagination(pageNo, pageSize)
      );
      const data = await Onsites.aggregate(queryGetDataHavePagination);
      // After search, back to first state
      return res.json({
        status: ERROR.NO_ERROR,
        message: MESSAGE.SUCCESSFULL,
        data,
        total: total.length === 0 ? 0 : total[0].total,
      });
      // if condition not have projectId
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Fail.',
      });
    }
  }
  async requestApproval(req, res) {
    try {
      const onsitesID = req.params.id;
      const { action = 0, reason = '' } = req.body;
      const updateAction = await Onsites.findOneAndUpdate(
        { _id: ObjectId(onsitesID) },
        { $set: { approved: action, reason: reason ? reason : '' } }
      );
      if (updateAction === null) {
        throw {
          message: 'Onsites ID not exist in DB.',
        };
      }
      return res.json({
        status: ERROR.NO_ERROR,
        message: 'Update successfull.',
      });
    } catch (error) {
      console.log(`🛠 LOG: 🚀 -->: ----------------------------`);
      console.log(`🛠 LOG: 🚀 -->: error`, error);
      console.log(`🛠 LOG: 🚀 -->: ----------------------------`);
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Fail.',
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

          /**=======================
           * todo      get onsite info
           *  firstday: 1,
           * lastday: 30 0r 31 or 29 or 28
           *
           *========================**/
          const ownerOnsites = await Onsites.aggregate(
            this.query.queryOnsites(item, firstDay, lastDay)
          );
          // Set value of cell A1 to employee name as a string type styled with paramaters of style
          ws.cell(1, 1).string('Dự án').style(style);

          // Set value of cell B1 to 200 as a number type styled with paramaters of style
          ws.cell(1, 2).string('Ngày').style(style);

          // Set value of cell C1 to a formula styled with paramaters of style
          ws.cell(1, 3).string('Từ').style(style);

          // Set value of cell A2 to 'sntring' styled with paramaters of style
          ws.cell(1, 4).string('Đến').style(style);

          ws.cell(1, 5).string('Ghi chú').style(style);

          // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
          let index = 2;
          if (ownerOnsites.length) {
            await Promise.all(
              ownerOnsites.map(async (value) => {
                const project = value.projectInformation;
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

                ws.cell(index, 5).string(value.reason).style(itemStyle);
                index++;
              })
            );
            const total = ownerOnsites.length * +treatment[0].onsiteTreatment;
            if (total > 0) {
              dashboard.push({
                employee: item,
                amount: ownerOnsites.length,
                total,
              });
            }
            ws.cell(index, 1).string('Tổng').style(totalStyle);
            ws.cell(index, 2).number(ownerOnsites.length).style(totalStyle);
            ws.cell(index, 3).string('Ngày').style(totalStyle);
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
      wsDashboard.cell(1, 3).string('Số ngày').style(style);

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

      const nameFile = `onsite_thang_${
        new Date().getMonth() + 1
      }_nam_${new Date().getFullYear()}.xlsx`;
      await wb.write(`reports/${nameFile}`, (err, stats) => {
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
                `🛠 LOG: 🚀 --> -----------------------------------------------------------------------------------`
              );
              console.log(
                `🛠 LOG: 🚀 --> ~ file: ots.controller.js ~ line 363 ~ returnres.download ~ err`,
                err
              );
              console.log(
                `🛠 LOG: 🚀 --> -----------------------------------------------------------------------------------`
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
        `🛠 LOG: 🚀 --> ~ file: onsites.controller.js ~ line 311 ~ exportExcel: ~ error`,
        error
      );
      console.log(
        `🛠 LOG: 🚀 --> -------------------------------------------------------------------------------------`
      );
      res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Have some trouble',
      });
    }
  }
}
module.exports = OnsitesControllers;
