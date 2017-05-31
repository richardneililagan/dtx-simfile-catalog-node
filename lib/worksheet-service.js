const chalk = require('chalk')
const xlsx = require('exceljs')
const groupBy = require('lodash/groupBy')
const each = require('lodash/each')
const logger = require('./logging-service')

const lib = {}

function initializeWorksheet() {
  const workbook = new xlsx.Workbook()
  const worksheet = workbook.addWorksheet('DTX Files')

  worksheet.columns = [
    { header: 'Song Name', key: 'title', width: 32 },
    { header: 'Artist', key: 'artist', width: 32 },
    { header: 'Comments', key: 'comments', width: 50 }
  ]

  return { workbook, worksheet }
}

lib.exportToWorksheet = metadata => {
  const task = logger.add('Preparing workbook')
  task.status('initializing').details('Creating workbook')
  const { workbook, worksheet } = initializeWorksheet()

  return new Promise((resolve, reject) => {
    task.status('flushing')

    groupBy(metadata, m => m.dir).each((files, dir) => {
      const dirTask = logger.add(`Flush: ${dir}`)
      let reduce = 0

      task.details(dir)
      worksheet.addRow({ title: dir })

      each(files, file => {
        dirTask.details(`${++reduce} songs flushed.`)

        worksheet.addRow({
          title: file.title,
          artist: file.author,
          comments: file.comments || ''
        })
      })

      dirTask.done()
    })

    const filename = `dtxsongs_${Date.now()}.xlsx`
    task.status('finalizing').details(filename)

    workbook.xlsx
      .writeFile(filename)
      .then(_ => {
        task.done().details(`Workbook ${chalk.yellow(filename)} created.`)
        resolve()
      })
  })
}

module.exports = lib
