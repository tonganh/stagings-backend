const yup = require('yup');
module.exports = yup.object({
  employee: yup.string().required(),
  project: yup.string().required(),
  ship: yup.string().required(),
  date: yup.string().required(),
  from: yup.string().required(),
  to: yup.string().required(),
});
