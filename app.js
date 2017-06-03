const compact = require('lodash/compact')

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
    let failures = 0

    return Promise.all(
      files.map(f => manifestService
        .getSongManifest(f)
        .then(manifest => {
          task.details(`${++reduce} manifests completed.`)
          return manifest
        })
        .then(manifest => manifestService.getSongMetadata(manifest))
        .catch(_ => {
          failures = failures + 1
        })
        .then(m => m)
      )
    ).then(metas => {
      if (failures) {
        const failureReport = logger.add('Some songs failed to load.')
        failureReport.fail(`${failures} songs.`)
      }

      task.done()
      return compact(metas)
    })
  })
  .then(metas => worksheetService.exportToWorksheet(metas))
  .then(_ => appTask.done().details('Finished.'))
