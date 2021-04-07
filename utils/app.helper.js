const moment = require('moment');
const PROJECT_STATUS = {
  DOING: 'DOING',
  DONE: 'DONE',
  PENDING: 'PENDING',
  REJECT: 'REJECT',
};

const EMPLOYEE_STATUS = {
  DOING: 'DOING',
  PENDING: 'PENDING',
  ENTIRED: 'ENTIRED',
};

const APPROVAL_STATUS = {
  DONE: 1,
  REJECT: 0,
  PENDING: 2,
};
function validateField(obj, fieldName, callback) {
  if (obj === undefined || obj === null) {
    return false;
  } else if (obj === '') {
    throw {
      message: { fieldName: `${fieldName} must be required` },
    };
  } else if (callback) {
    if (!callback(obj)) {
      return false;
    }
  }
  return true;
}

function checkStatusOtOnsite(status) {
  switch (status) {
    case APPROVAL_STATUS.REJECT:
      return 'REJECT';
    case APPROVAL_STATUS.DONE:
      return 'APPROVED';
    default:
      return 'PENDING';
  }
}
function formatAmountForeign(textValue) {
  textValue += '';
  textValue = textValue.replace(/[^\d]/g, '');
  if (textValue.length == 2 && textValue.indexOf('0') == 0) {
    textValue = textValue.replace('0', '');
  }
  if (textValue.length > 3) {
    let temp = '';
    let lengthString = textValue.length;
    if (textValue == '') {
      textValue = '0';
    }
    while (lengthString > 3) {
      temp = `,${textValue.substr(lengthString - 3, lengthString)}${temp}`;
      textValue = textValue.substr(0, lengthString - 3);
      lengthString = textValue.length;
    }
    temp = textValue.substr(0, lengthString) + temp;
    textValue = temp;
  }
  return textValue;
}
function clearFormatAmount(amountFormatText) {
  return amountFormatText.replace(/,/g, '');
}
function formatAmountText(text) {
  if (!text) {
    return 0;
  }
  if (typeof text === 'string') {
    text = clearFormatAmount(text);
  }
  const number = `${text}`.split('.');
  if (number.length > 1) {
    if (text >= 0) {
      return `${formatAmountForeign(number[0])}.${number[1]}`;
    }
    return `-${formatAmountForeign(number[0])}.${number[1]}`;
  }
  if (text >= 0) {
    return formatAmountForeign(number[0]);
  }
  return `-${formatAmountForeign(number[0])}`;
}
const workTimeInOneSession = (to, from) => {
  const sectionFrom = moment(from, 'DD/MM/YYYY HH:mm').valueOf();
  const sectionTo = moment(to, 'DD/MM/YYYY HH:mm').valueOf();

  const convertToMinute = Math.floor((sectionTo - sectionFrom) / 60000);
  // get integer of time to hour
  const hour = Math.floor(convertToMinute / 60);
  // minute unit time remaining
  const minute = convertToMinute / 60 - hour;
  if (minute < 0.3) {
    return hour;
  } else if (0.3 < minute && minute < 0.7) {
    return hour + 0.5;
  } else {
    return hour + 1;
  }
};
module.exports = {
  PROJECT_STATUS,
  EMPLOYEE_STATUS,
  APPROVAL_STATUS,
  validateField,
  checkStatusOtOnsite,
  formatAmountText,
  workTimeInOneSession,
};
