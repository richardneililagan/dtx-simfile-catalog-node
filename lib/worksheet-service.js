const chalk = require('chalk')
const xlsx = require('exceljs')

const _ = require('lodash')

const groupBy = require('lodash/groupBy')
const each = require('lodash/each')
const merge = require('lodash/merge')

const logger = require('./logging-service')
const styling = require('./worksheet-styling')

const lib = {}

// :: styling information
workbookFont = merge({}, styling.font)
workbookAlignment = merge({}, styling.alignment)
workbookFill = merge({}, styling.fill)

directoryFont = merge({}, workbookFont, {
  color: { argb: 'FF000000' },
  bold: true
})
directoryAlignment = merge({}, workbookAlignment)
directoryFill = merge({}, styling.fill, {
  type: 'pattern',
  pattern: 'solid',
  bgColor: { argb: 'FFEEEEEE' },
  fgColor: { argb: 'FFEEEEEE' }
})

songFont = merge({}, workbookFont)
songAlignment = merge({}, workbookAlignment)
songFill = merge({}, workbookFill)

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
  worksheet.lastRow.fill = workbookFill

  return { workbook, worksheet }
}

function validateSong(file) {
  return !!((file.title || '').trim())
}

lib.exportToWorksheet = metadata => {
  const task = logger.add('Preparing workbook')
  task.status('initializing').details('Creating workbook')

  const { workbook, worksheet } = initializeWorksheet()

  return new Promise((resolve, reject) => {

    task.status('flushing')

    _.chain(metadata)
      .groupBy(m => m.group)
      .each((files, dir) => {
        const dirTask = logger.add(`Flush: ${dir}`)
        let reduce = 0

        task.details(dir)

        // :: set directory row styling
        const row = worksheet.addRow({ title: dir })

        _.chain(files)
          .filter(validateSong)
          .sortBy(file => file.title)
          .each(file => {
            const row = worksheet.addRow({
              title: file.title,
              artist: file.author,
              comments: file.comments || ''
            })

            // :: styling information ---
            row.font = songFont
            row.alignment = songAlignment
            row.fill = songFill

            row.getCell(1).alignment = merge({}, songAlignment, {
              indent: 2
            })

            dirTask.details(`${++reduce} songs flushed.`)
          })
          .commit()

        // :: just in case nothing was added
        if (reduce === 0) {
          row.hidden = true
          dirTask.details('No valid files found.').fail('Empty')
        } else {
          // :: styling information ---
          row.font = directoryFont
          row.alignment = directoryAlignment
          row.fill = directoryFill

          row.height = directoryFont.size * 1.8

          // :: add an empty row after each directory
          worksheet.addRow(['']).fill = workbookFill
          dirTask.done()
        }
      })
      .commit()

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
