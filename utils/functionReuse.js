const { validateField } = require('./app.helper');
// const moment = require('moment');
const PAGE_SIZE = 10;
const moment = require('moment');
const reUseFunction = {
  removeVietnameseTones: (str) => {
    if (str !== '') {
      str = str.toLowerCase().trim();
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
      str = str.replace(/đ/g, 'd');
    }
    return str;
  },
  datasatisfying: (dataSatisFying, pageSize = PAGE_SIZE, pageNo = 1) => {
    return dataSatisFying.splice((pageNo - 1) * pageSize, pageSize);
  },
  checkValidate: (arrayCheck) => {
    const errorField = [];
    for (const [key, value] of Object.entries(arrayCheck)) {
      if (!validateField(value, key)) {
        errorField.push(key);
      }
    }
    return errorField;
  },
  lastDayInMonth: (monthSearch) => {
    const splitMonthYear = monthSearch.split('-');
    // convert to month in number
    const month = parseInt(splitMonthYear[0]);
    // convert year to number
    const year = parseInt(splitMonthYear[1]);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    return {
      lastDay,
      firstDay,
    };
  },
  monthInsertDB: (month, year) => {
    if (month < 10) {
      return `0${month}-${year}`;
    } else return `${month}-${year}`;
  },
  querySplitPagination: (pageNo, pageSize) => {
    const page = parseInt(pageNo);
    const limit = parseInt(pageSize);
    return [
      {
        $skip: limit * (page - 1),
      },
      {
        $limit: limit,
      },
    ];
  },
  returnConditionsDate: (start, finish) => {
    if (start !== '' && finish !== '') {
      return {
        $match: {
          date: {
            $gte: moment(start)._d,
            $lte: moment(finish)._d,
          },
        },
      };
    } else if (start === '' && finish === '') {
      return '';
    } else if (finish === '') {
      return {
        $match: {
          date: { $gte: moment(start)._d },
        },
      };
    } else if (start === '') {
      return {
        $match: {
          date: { $lte: moment(finish)._d },
        },
      };
    }
  },
};
module.exports = reUseFunction;
