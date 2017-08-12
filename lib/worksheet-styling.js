const merge = require('lodash/merge')

const styling = {
  font: {
    name: 'Calibri',
    color: { argb: 'FF444444' },
    size: 10,
    italic: false
  },
  alignment: {
    horizontal: 'left',
    vertical: 'middle'
  },
  fill: {
    type: 'pattern',
    pattern: 'solid',
    bgColor: { argb: 'FFFFFFFF' },
    fgColor: { argb: 'FFFFFFFF' }
  }
}

module.exports = styling
