const glob = require('glob')
const logger = require('./logging-service')
const lib = {}

lib.getSongDefinitions = _ => {
  return new Promise((resolve, reject) => {
    const task = logger.add('Gathering DTX / GDA song manifests')

    glob('**/*.{dtx,gda}', { nocase: true }, (err, files) => {
      if (err) return reject(err)
      // :: ---
      task.done().details(`${files.length} sets found.`)
      return resolve(files)
    })
  })
}

module.exports = lib
