const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const bankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    accNo: {
      type: String,
      required: true,
    },
    accName: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    main: {
      type: Boolean,
      default: true,
    },
    employee: {
      type: ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

const Banks = mongoose.model('Bank', bankSchema);

module.exports = Banks;
