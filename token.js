const jwt = require('jsonwebtoken');
const token = {
  generate: (user, secretToken) => {
    console.log(
      '123',
      jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        secretToken
      )
    );
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secretToken
    );
  },
  decode: (hash, secretToken) => {
    return jwt.verify(hash, secretToken);
  },
};

module.exports = token;
