/* eslint-disable no-use-before-define */
/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const salariesSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    treatmentID: {
      type: mongoose.Types.ObjectId,
      // required: true,
    },
    ot: {
      type: Number,
    },
    onsite: {
      type: Number,
    },
    subsidize: {
      type: Number,
    },
    month: {
      type: String,
    },
    advancePayment: {
      type: Number,
    },
    total: {
      type: Number,
    },
    state: {
      type: Boolean,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
    note: {
      type: String,
    },
    paidDate: {
      type: Date,
    },
    error: {
      type: Array,
    },
    tags: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const Salaries = mongoose.model('salaries', salariesSchema);
module.exports = Salaries;
