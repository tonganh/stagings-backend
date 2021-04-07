const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../../../../models/employees');
const { ERROR } = require('../../../../utils/error.helper');
const Token = require('../../../../token');
const { v1: uuidv1 } = require('uuid');
const moment = require('moment');
const MailHelpers = require('../../../../utils/mail.helper');
const Sessions = require('../../../../models/sessions');

const TOKEN_SECRET_ADMIN =
  process.env.TOKEN_SECRET_ADMIN || 'youraccesstokensecret';
class LoginController {
  async getToken(req, res) {
    try {
      const dataUser = await Employee.findOne({
        email: req.body.email,
        role: 'AD',
      });
      if (!dataUser) {
        return res.json({
          status: ERROR.UNAUTHEN_ERROR,
          error: 'Không tồn tại người dùng!',
        });
      }
      const valid = await bcrypt.compare(req.body.password, dataUser.password);
      if (!valid) {
        return res.json({
          status: ERROR.UNAUTHEN_ERROR,
          error: 'Sai mật khẩu!',
          // new Error('Incorrect password!'),
        });
      }
      const access_token = Token.generate(dataUser, TOKEN_SECRET_ADMIN);

      res.json({
        status: ERROR.NO_ERROR,
        data: {
          _id: dataUser._id,
          is_reset: dataUser.is_reset,
          name: dataUser.name,
          email: dataUser.email,
          role: dataUser.role,
          access_token,
        },
      });
    } catch (error) {
      res.json({
        status: ERROR.UNAUTHEN_ERROR,
        error,
      });
    }
  }
  async getDataFromToken(req, res) {
    try {
      const checkToken = await jwt.verify(req.params.token, TOKEN_SECRET_ADMIN);
      const checkLoginWithToken = await Employee.findOne({
        _id: checkToken.userId,
      });
      return res.json({
        status: ERROR.NO_ERROR,
        data: {
          _id: checkLoginWithToken._id,
          is_reset: checkLoginWithToken.is_reset,
          name: checkLoginWithToken.name,
          email: checkLoginWithToken.email,
          role: checkLoginWithToken.role,
        },
      });
    } catch (err) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        err: err,
      });
    }
  }
  async sendEmail(req, res) {
    try {
      const { email } = req.body;
      const emp = await Employee.findOne({ email });
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
        MailHelpers.send('hisoft', email, token);
        res.json({
          status: ERROR.NO_ERROR,
          message: 'check your email to get link change password.',
        });
      } else {
        res.json({
          status: ERROR.ERROR_LOGIC,
          message: 'User not exist in system',
        });
      }
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
      check
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
  async changePassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      const session = await Sessions.findOne({ token });
      if (!session) {
        throw 'invalid token';
      }
      const emp = await Employee.findOne({ email: session.email });
      const { expired } = session;
      const check = session.checkExpiredToken(expired);
      if (check) {
        emp.password = newPassword;
        emp.isReset = true;
        await emp.save();
        res.json({
          status: ERROR.NO_ERROR,
          message: 'change password successful',
        });
      } else {
        res.json({
          status: ERROR.ERROR_LOGIC,
          message: 'expired token',
        });
      }
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
module.exports = LoginController;
