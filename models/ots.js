const mongoose = require('mongoose');

const otsSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    project: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    ship: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    approved: {
      type: Number,
      required: true,
      default: 2,
      // 0: decline  ; 1-approve; 2-pending
    },
    // reason of admin to approve? decline
    reason: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Ots = mongoose.model('Ot', otsSchema);

module.exports = Ots;
