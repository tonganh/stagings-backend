const yup = require('yup');
module.exports = yup.object({
  name: yup.string().required(),
  accNo: yup.string().required(),
  accName: yup.string().required(),
  branch: yup.string().required(),
  main: yup.boolean().required(),
});
