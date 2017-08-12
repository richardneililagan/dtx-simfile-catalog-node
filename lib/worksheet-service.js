const chalk = require('chalk')
const xlsx = require('exceljs')
const groupBy = require('lodash/groupBy')
const each = require('lodash/each')
const merge = require('lodash/merge')

const logger = require('./logging-service')
const styling = require('./worksheet-styling')

const lib = {}

// :: styling information
workbookFont = merge({}, styling.font)
workbookAlignment = merge({}, styling.alignment)

directoryFont = merge({}, workbookFont, {
  color: { argb: 'FF000000' },
  bold: true
})
directoryAlignment = merge({}, workbookAlignment)

songFont = merge({}, workbookFont)
songAlignment = merge({}, workbookAlignment)

function initializeWorksheet() {

  const workbook = new xlsx.Workbook()
  const worksheet = workbook.addWorksheet('DTX Files')

  worksheet.columns = [
    { header: 'Song Name', key: 'title', width: 32 },
    { header: 'Artist', key: 'artist', width: 32 },
    { header: 'Comments', key: 'comments', width: 50 }
  ]

  worksheet.lastRow.font = workbookFont
  worksheet.lastRow.alignment = workbookAlignment

  return { workbook, worksheet }
}

lib.exportToWorksheet = metadata => {
  const task = logger.add('Preparing workbook')
  task.status('initializing').details('Creating workbook')
  const { workbook, worksheet } = initializeWorksheet()

  return new Promise((resolve, reject) => {
    task.status('flushing')

    const groups = groupBy(metadata, m => m.dir)
    each(groups, (files, dir) => {
      const dirTask = logger.add(`Flush: ${dir}`)
      let reduce = 0

      task.details(dir)

      // :: set directory row styling
      const row = worksheet.addRow({ title: dir })

      each(files, file => {
        dirTask.details(`${++reduce} songs flushed.`)

        const row = worksheet.addRow({
          title: file.title,
          artist: file.author,
          comments: file.comments || ''
        })

        // :: styling information ---
        row.font = songFont
        row.alignment = songAlignment

        row.getCell(1).alignment = merge({}, songAlignment, {
          indent: 2
        })
      })

      // :: styling information ---
      row.font = directoryFont
      row.alignment = directoryAlignment

      // :: add an empty row after each directory
      worksheet.addRow([])
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
