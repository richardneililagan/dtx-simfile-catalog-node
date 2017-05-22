const xlsx = require('exceljs')
const groupBy = require('lodash/groupBy')
const each = require('lodash/each')

const lib = {}

function initializeWorksheet() {
  const workbook = new xlsx.Workbook()
  const worksheet = workbook.addWorksheet('DTX Files')

  worksheet.columns = [
    { header: 'Song Name', key: 'title' },
    { header: 'Artist', key: 'artist' },
    { header: 'Comments', key: 'comments' }
  ]

  return { workbook, worksheet }
}

lib.exportToWorksheet = metadata => {
  const { workbook, worksheet } = initializeWorksheet()

  return new Promise((resolve, reject) => {
    const metasByDir = groupBy(metadata, m => m.dir)
    each(metasByDir, (files, dir) => {
      worksheet.addRow({ title: dir })

      each(files, file => {
        worksheet.addRow({
          title: file.title,
          artist: file.author,
          comments: file.comments || ''
        })
      })
    })

    workbook.xlsx
      .writeFile(`dtxsongs_${Date.now()}.xlsx`)
      .then(resolve)
  })
}

module.exports = lib
