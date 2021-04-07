const mongoose = require('mongoose');
const treatmentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    onsiteTreatment: {
      type: Number,
      required: true,
      default: 0,
    },
    otTreatment: {
      type: Number,
      requied: true,
      default: 0,
    },
    travelTreatment: {
      type: Number,
      requied: true,
      default: 0,
    },
    outsourceSalary: {
      type: Number,
      requied: true,
      default: 0,
    },
    phoneTreatment: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Treatment = mongoose.model('treatments', treatmentSchema);

module.exports = Treatment;
