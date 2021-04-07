const token = require('../../../token');
const whitelist = [
  '/login',
  '/forgot-password/send-email',
  '/forgot-password/check-token-expired',
  '/forgot-password/change-password',
];
const TOKEN_SECRET_ADMIN =
  process.env.TOKEN_SECRET_ADMIN || 'youraccesstokensecret';

module.exports = {
  authorize: (req, res, next) => {
    try {
      console.log('middle ware admin', req.url, whitelist);
      if (whitelist.includes(req.url)) {
        console.log('next');
        next();
        return;
      }
      const bearerHeader = req.headers['authorization'];
      console.log(
        `🛠 LOG: 🚀 --> ---------------------------------------------------------------------`
      );
      console.log(
        `🛠 LOG: 🚀 --> ~ file: auth.js ~ line 16 ~ bearerHeader`,
        bearerHeader
      );
      console.log(
        `🛠 LOG: 🚀 --> ---------------------------------------------------------------------`
      );
      if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        const user = token.decode(bearerToken, TOKEN_SECRET_ADMIN);
        console.log(
          `🛠 LOG: 🚀 --> ---------------------------------------------------------------------------------`
        );
        console.log(
          `🛠 LOG: 🚀 --> ~ file: auth.js ~ line 27 ~ TOKEN_SECRET_ADMIN`,
          TOKEN_SECRET_ADMIN
        );
        console.log(
          `🛠 LOG: 🚀 --> ---------------------------------------------------------------------------------`
        );

        console.log(
          `🛠 LOG: 🚀 --> -----------------------------------------------------`
        );
        console.log(`🛠 LOG: 🚀 --> ~ file: auth.js ~ line 23 ~ user`, user);
        console.log(
          `🛠 LOG: 🚀 --> -----------------------------------------------------`
        );
        if (user) {
          req.token = bearerToken;
          req.user = user;
          next();
        } else {
          res.status(403).json({
            status: 403,
            message: 'Unauthorize',
          });
        }
      } else {
        res.status(403).json({
          status: 403,
          message: 'Unauthorize',
        });
      }
    } catch (error) {
      res.status(403).json({
        status: 403,
        message: 'Unauthorize',
      });
    }
  },
};
