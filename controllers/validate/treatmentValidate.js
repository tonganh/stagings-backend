const yup = require('yup');
module.exports = yup.object({
  employee: yup.string().required(),
  basicSalary: yup.number().required(),
  onsiteTreatment: yup.number().required(),
  otTreatment: yup.number().required(),
  travelTreatment: yup.number().required(),
});
