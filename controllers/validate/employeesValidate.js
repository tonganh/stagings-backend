const yup = require('yup');
module.exports = yup.object({
  email: yup.string().email().required(),
  name: yup.string().required(),
  phone: yup.string().required(),
  state: yup.string().required(),
});
