const token = require('../token');
const whitelist = [
  '/login',
  '/send-email',
  '/check-token-expired',
  '/forgot-password',
];
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'youraccesstokensecret';

module.exports = {
  authorize: (req, res, next) => {
    try {
      console.log(req.url);
      if (whitelist.includes(req.url)) {
        console.log('next');
        next();
        return;
      }
      const bearerHeader = req.headers['authorization'];
      if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        const user = token.decode(bearerToken, TOKEN_SECRET);
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
