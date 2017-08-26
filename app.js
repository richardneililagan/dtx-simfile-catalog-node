const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const pkg = require('./package.json')

const program = require('commander')
  .version(pkg.version)
  .option('-p, --parallel [number]', 'Directories to open at the same time', parseInt)
  .parse(process.argv)

const filesService = require('./lib/files-service')
const manifestService = require('./lib/manifest-service')
const worksheetService = require('./lib/worksheet-service')
const logger = require('./lib/logging-service')

const fill = require('lodash/fill')
const groupBy = require('lodash/groupBy')
const map = require('lodash/map')

// :: ---

const concurrency = program.parallel || 20
const throat = require('throat')(concurrency)

class SongFile {
  get directoryGroup () {
    return path.dirname(path.dirname(this.basepath))
  }

  get songDirectory () {
    return path.dirname(this.basepath)
  }

  constructor (basepath) {
    this.basepath = basepath
  }
}

// :: ---

const appTask = logger.add(`Summarizing current directory`)
  .details(`Concurrency: ${concurrency}`)

filesService.getSongDefinitions()
  .then(ensureIntegrity)
  .then(files => files.map(file => new SongFile(file)))
  .then(parseSongs)
  .then(metadata => worksheetService.exportToWorksheet(metadata))
  .then(flushComplete)
  .then(_ => appTask.done().details('Finished.'))

// :: ---

function ensureIntegrity (files) {
  const task = logger.add('Verifying file integrity')
  const validFiles = files.filter(file => fs.existsSync(file))

  task.done().details(`${validFiles.length} files valid.`)

  return validFiles
}

function parseSongs (songfiles) {
  const task = logger.add('Parsing song files')

  const songGroups = groupBy(songfiles, file => file.songDirectory)
  const tasks = map(songGroups, group => throat(() => manifestService.getSongMetadata(...group)))

  return Promise.all(tasks)
    .then(metadata => {
      task.done().details(`${metadata.length} songs found.`)
      return metadata
    })
}

function flushComplete (workbook) {
  const say = console.log
  // :: ---

  say('')
  say(fill(Array(80), '-').join(''))
  say('')

  say(`${chalk.magenta('All done!')} Your workbook is ${chalk.yellow(workbook)}.`)
}
