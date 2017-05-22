const chalk = require('chalk')
const observatory = require('observatory').settings({
  prefix: chalk.cyan('[DTX Summarizer] ')
})

module.exports = observatory
