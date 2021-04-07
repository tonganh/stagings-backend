const Treatment = require('../../../../models/treatment');
const { ERROR } = require('../../../../utils/error.helper');
const { ObjectID } = require('mongodb');
const treatmentValidate = require('../../../validate/treatmentValidate');
const TreatmentsQuery = require('../query/treatments.query');

class TreatmentControllers {
  constructor() {
    this.query = new TreatmentsQuery();
  }
  async addTreatMent(req, res) {
    try {
      const dataCreate = { ...req.body };
      await treatmentValidate.validate(req.body, { abortEarly: false });
      const addTreatment = await Treatment.create(dataCreate);
      if (addTreatment) {
        res.json({
          status: ERROR.NO_ERROR,
          message: 'Successfull',
          data: addTreatment,
        });
      }
    } catch (error) {
      console.log(`🛠 LOG: 🚀 -->: ----------------------------`);
      console.log(`🛠 LOG: 🚀 -->: error`, error.message);
      console.log(`🛠 LOG: 🚀 -->: ----------------------------`);
      res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.errors || error.message,
      });
    }
  }
  async getDetailEmployeeTreatment(req, res) {
    try {
      const { id } = req.params;
      // id is employeeID.
      const employeeTreatmentDetail = await Treatment.aggregate(
        this.query.detailPayment(id)
      );
      if (employeeTreatmentDetail.length === 0) {
        throw {
          message: 'Employee ID not exist.',
        };
      }
      return res.json({
        status: ERROR.NO_ERROR,
        data: employeeTreatmentDetail[0],
      });
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Fail.',
      });
    }
  }
  async deleteTreatment(req, res) {
    try {
      const { id } = req.params;
      const actionDelete = await Treatment.deleteOne({ _id: ObjectID(id) });
      console.log('actionDelete', actionDelete);
      if (actionDelete.deletedCount) {
        return res.json({
          status: ERROR.NO_ERROR,
          message: 'Deleted',
        });
      }
      throw {
        message: 'Tratement id not exist in DB',
      };
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Fail.',
      });
    }
  }
}
module.exports = TreatmentControllers;
