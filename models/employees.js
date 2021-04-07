const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    personalEmail: {
      type: String,
    },
    isReset: {
      type: Boolean,
      required: true,
      default: false,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ['EM', 'PM', 'AD'],
    },
    baseSalary: {
      type: Number,
    },
    otRate: {
      type: Number,
    },
    dob: {
      type: Date,
    },
    startWorkAt: {
      type: Date,
    },
    position: {
      //Vi tri hien tai.
      type: String,
    },
    currentLocation: {
      type: String,
    },
    hometown: {
      type: String,
    },
    phone: {
      type: String,
    },
    state: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    employeeCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.pre('save', function (next) {
  try {
    const user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    // generate a salt
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password, salt);
    user.password = hash;
    next();
  } catch (error) {
    console.log('err ', error);
  }
});

employeeSchema.methods.comparePassword = function (candidatePassword) {
  return new Promise((resolve, reject) => {
    try {
      const isMatch = bcrypt.compareSync(candidatePassword, this.password);
      resolve(isMatch);
    } catch (err) {
      reject(err);
    }
  });
};
const Employee = mongoose.model('employees', employeeSchema);
module.exports = Employee;
