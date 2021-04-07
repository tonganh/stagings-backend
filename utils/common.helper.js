const moment = require('moment');

const getDifferenceTime = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  console.log(diffTime + ' milliseconds');
  console.log(diffDays + ' days');
  return {
    diffTime,
    diffDays,
  };
};

const getTimeAgo = (time) => {
  const format = 'YYYYMMDD HH';
  const dateFormatted = moment(time).format(format);
  return moment(dateFormatted, format).lang('en').fromNow();
};

module.exports = {
  getDifferenceTime,
  getTimeAgo,
};
