const mongoose = require('mongoose');

const sessionsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expired: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

sessionsSchema.methods.checkExpiredToken = function (expired) {
  const diff = new Date() - new Date(expired);
  if (diff > 0) {
    // đã hết hạn token
    return false;
  } else {
    return true;
  }
};
const Sessions = mongoose.model('Session', sessionsSchema);

module.exports = Sessions;
