const Employees = require('../../models/employees');
const Sessions = require('../../models/sessions');
const Token = require('../../token');
const moment = require('moment');
const { ERROR } = require('../../utils/error.helper');
const { v1: uuidv1 } = require('uuid');
const MailHelpers = require('../../utils/mail.helper');
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'youraccesstokensecret';

class AuthControllers {
  async login(req, res) {
    const { email, password } = req.body;
    const emp = await Employees.findOne({ email });
    if (emp && password) {
      const isMatch = await emp.comparePassword(password);
      if (isMatch) {
        const token = Token.generate(emp, TOKEN_SECRET);
        res.json({
          status: ERROR.NO_ERROR,
          data: {
            _id: emp._id,
            is_reset: emp.isReset,
            name: emp.name,
            email: emp.email,
            role: emp.role,
            access_token: token,
          },
        });
        return;
      }
    }
    res.json({
      status: ERROR.HANDLE_ERROR,
      message: 'Login fail. Email or Password incorrect',
    });
  }
  async changePass(req, res) {
    const { email, oldPassword, newPassword } = req.body;
    const emp = await Employees.findOne({ email });
    if (emp) {
      const isMatch = await emp.comparePassword(oldPassword);
      if (isMatch) {
        emp.password = newPassword;
        emp.isReset = true;
        await emp.save();
        res.json({
          status: ERROR.NO_ERROR,
          message: 'change password successful',
        });
        return;
      }
    }
    res.json({
      status: ERROR.HANDLE_ERROR,
      message: 'Change password fail',
    });
  }
  async sendEmail(req, res) {
    try {
      const { email } = req.body;
      const emp = await Employees.findOne({ email });
      if (emp) {
        const token = uuidv1();
        const query = { email };
        const update = {
          $set: {
            token,
            expired: moment().add(0.5, 'hours').toDate(),
          },
        };
        const options = { upsert: true };
        await Sessions.updateOne(query, update, options);
        MailHelpers.send(process.env.EMAIL_USERNAME, email, token, true);
        return res.json({
          status: ERROR.NO_ERROR,
          message: 'check your email to get link change password.',
        });
      }
      return res.json({
        status: ERROR.ERROR_LOGIC,
        message: 'User not exist in system',
      });
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        error,
      });
    }
  }
  async checkTokenExprired(req, res) {
    try {
      const { token } = req.body;
      const session = await Sessions.findOne({ token });
      if (!session) {
        throw 'invalid token';
      }
      const { expired } = session;
      const check = session.checkExpiredToken(expired);
      return check
        ? res.json({
            status: ERROR.NO_ERROR,
            message: `OK`,
          })
        : res.json({
            status: ERROR.ERROR_LOGIC,
            message: 'expired token',
          });
    } catch (error) {
      console.log('====================================');
      console.log('error', error);
      console.log('====================================');
      res.json({
        status: ERROR.HANDLE_ERROR,
        error,
      });
    }
  }
  async forgotPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      const session = await Sessions.findOne({ token });
      if (!session) {
        throw 'invalid token';
      }
      const emp = await Employees.findOne({ email: session.email });
      const { expired } = session;
      const check = session.checkExpiredToken(expired);
      if (check) {
        emp.password = newPassword;
        emp.isReset = true;
        await emp.save();
        return res.json({
          status: ERROR.NO_ERROR,
          message: 'change password successful',
        });
      }
      return res.json({
        status: ERROR.ERROR_LOGIC,
        message: 'expired token',
      });
    } catch (error) {
      console.log('====================================');
      console.log('error', error);
      console.log('====================================');
      res.json({
        status: ERROR.HANDLE_ERROR,
        error,
      });
    }
  }
}
module.exports = AuthControllers;
