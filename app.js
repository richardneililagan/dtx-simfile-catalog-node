const groupBy = require('lodash/groupBy')
const each = require('lodash/each')

const filesService = require('./lib/files-service')
const manifestService = require('./lib/manifest-service')
const worksheetService = require('./lib/worksheet-service')
const logger = require('./lib/logging-service')

const appTask = logger.add('Summarizing current directory')

filesService.getSetDefinitions()
  .catch(err => {
    console.error(err)
  })
  .then(files => {
    const task = logger.add('Reading manifests')
    let reduce = 0

    return Promise.all(
      files.map(f => manifestService
        .getSongManifest(f)
        .then(manifest => {
          task.details(`${++reduce} manifests completed.`)
          return manifest
        })
        .then(manifest => manifestService.getSongMetadata(manifest))
      )
    ).then(metas => {
      task.done()
      return metas
    })
  })
  .then(metas => worksheetService.exportToWorksheet(metas))
  .then(_ => {
    appTask.done().details('Finished.')
  })
