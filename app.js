const groupBy = require('lodash/groupBy')
const each = require('lodash/each')

const filesService = require('./lib/files-service')
const manifestService = require('./lib/manifest-service')
const worksheetService = require('./lib/worksheet-service')

filesService.getSetDefinitions()
  .catch(err => {
    console.error(err)
  })
  .then(files => Promise.all(
    files.map(f => manifestService
      .getSongManifest(f)
      .then(manifest => manifestService.getSongMetadata(manifest))
    )
  ))
  .then(metas => worksheetService.exportToWorksheet(metas))
