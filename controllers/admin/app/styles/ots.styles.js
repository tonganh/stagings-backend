const headerStyles = {
  font: {
    color: '#FFFFFF',
    size: 14,
    name: 'Times',
    bold: true,
  },
  numberFormat: '$#,##0.00; ($#,##0.00); -',
  alignment: {
    wrapText: true,
    horizontal: 'center',
  },
  fill: {
    // §18.8.20 fill (Fill)
    type: 'pattern',
    patternType: 'solid',
    fgColor: '#0F243E', // HTML style hex value. defaults to black
    bgColor: '#0F243E',
  },
};

const itemStyles = {
  font: {
    color: '#000000',
    size: 14,
    name: 'Times',
  },
  alignment: {
    wrapText: true,
    horizontal: 'center',
  },
  border: {
    // §18.8.4 border (Border)
    left: {
      style: 'thin', //§18.18.3 ST_BorderStyle (Border Line Styles) ['none', 'thin', 'medium', 'dashed', 'dotted', 'thick', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'mediumDashDotDot', 'slantDashDot']
      color: '#000000', // HTML style hex value
    },
    right: {
      style: 'thin',
      color: '#000000',
    },
    top: {
      style: 'thin',
      color: '#000000',
    },
    bottom: {
      style: 'thin',
      color: '#000000',
    },
  },
};

const totalStyles = {
  font: {
    color: '#000000',
    size: 14,
    name: 'Times',
    bold: true,
  },
  alignment: {
    wrapText: true,
    horizontal: 'center',
  },
  border: {
    // §18.8.4 border (Border)
    left: {
      style: 'thin', //§18.18.3 ST_BorderStyle (Border Line Styles) ['none', 'thin', 'medium', 'dashed', 'dotted', 'thick', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'mediumDashDotDot', 'slantDashDot']
      color: '#000000', // HTML style hex value
    },
    right: {
      style: 'thin',
      color: '#000000',
    },
    top: {
      style: 'thin',
      color: '#000000',
    },
    bottom: {
      style: 'thin',
      color: '#000000',
    },
  },
  fill: {
    // §18.8.20 fill (Fill)
    type: 'pattern',
    patternType: 'solid',
    fgColor: '#D9D9D9', // HTML style hex value. defaults to black
    bgColor: '#D9D9D9',
  },
};

module.exports = {
  headerStyles,
  itemStyles,
  totalStyles,
};
