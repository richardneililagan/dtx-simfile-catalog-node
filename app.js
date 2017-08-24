const fs = require('fs')
const path = require('path')

const filesService = require('./lib/files-service')
const manifestService = require('./lib/manifest-service')
const worksheetService = require('./lib/worksheet-service')
const logger = require('./lib/logging-service')

const compact = require('lodash/compact')
const groupBy = require('lodash/groupBy')
const each = require('lodash/each')
const map = require('lodash/map')

// :: ---

class SongFile {
  get directoryGroup() {
    return path.dirname(path.dirname(this.basepath))
  }

  get songDirectory() {
    return path.dirname(this.basepath)
  }

  constructor(basepath) {
    this.basepath = basepath
  }
}

// :: ---

const appTask = logger.add('Summarizing current directory')

filesService.getSongDefinitions()
  .then(ensureIntegrity)
  .then(files => files.map(file => new SongFile(file)))
  .then(parseSongs)
  .then(metadata => worksheetService.exportToWorksheet(metadata))
  .then(_ => appTask.done().details('Finished.'))

// :: ---

function ensureIntegrity(files) {
  return files.filter(file => fs.existsSync(file))
}

function parseSongs(songfiles) {
  const songGroups = groupBy(songfiles, file => file.songDirectory)
  const tasks = map(songGroups, group => manifestService.getSongMetadata(...group))

  return Promise.all(tasks)
}

// filesService.getSetDefinitions()
//   .catch(err => {
//     console.error(err)
//   })
//   .then(files => {
//     const task = logger.add('Reading manifests')
//     let reduce = 0
//     let failures = 0

//     return Promise.all(
//       files.map(f => manifestService
//         .getSongManifest(f)
//         .then(manifest => {
//           task.details(`${++reduce} manifests completed.`)
//           return manifest
//         })
//         .then(manifest => manifestService.getSongMetadata(manifest))
//         .catch(_ => {
//           failures = failures + 1
//         })
//         .then(m => m)
//       )
//     ).then(metas => {
//       if (failures) {
//         const failureReport = logger.add('Some songs failed to load.')
//         failureReport.fail(`${failures} songs.`)
//       }

//       task.done()
//       return compact(metas)
//     })
//   })
//   .then(metas => worksheetService.exportToWorksheet(metas))
//   .then(_ => appTask.done().details('Finished.'))
