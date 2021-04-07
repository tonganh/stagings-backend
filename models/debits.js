const mongoose = require('mongoose');

const debitsSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    // time employee want to receive money.
    date: {
      type: Date,
      required: true,
    },
    dayWantReceiveMoney: {
      type: Date,
      required: true,
    },
    content: {
      type: String,
    },
    status: {
      type: String,
      enum: ['WAIT', 'APPROVAL', 'REJECT'],
      default: 'WAIT',
    },
    reason: {
      type: String,
      default: '',
    },
    // time admin sent money
    transdate: {
      type: Date,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);
const Debits = mongoose.model('debits', debitsSchema);
module.exports = Debits;
