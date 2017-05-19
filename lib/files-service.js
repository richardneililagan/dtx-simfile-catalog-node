const glob = require('glob')
const lib = {}

/**
 *  Gets all `set.def` files from the current directory
 *  in a recursize manner.
 */
lib.getSetDefinitions = _ => {
  return new Promise((resolve, reject) => {
    glob('./**/set.def', (er, files) => {
      if (er) return reject(er)
      return resolve(files)
    })
  })
}

module.exports = lib
