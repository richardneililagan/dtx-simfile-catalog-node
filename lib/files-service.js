const glob = require('glob')
const logger = require('./logging-service')
const lib = {}

/**
 *  Gets all `set.def` files from the current directory
 *  in a recursize manner.
 */
lib.getSetDefinitions = _ => {
  return new Promise((resolve, reject) => {
    const task = logger.add('Gathering DTX set definitions')

    glob('./**/set.def', (er, files) => {
      if (er) return reject(er)
      task.done().details(`${files.length} sets found.`)
      return resolve(files)
    })
  })
}

module.exports = lib
