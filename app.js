const groupBy = require('lodash/groupBy')
const each = require('lodash/each')

const filesService = require('./lib/files-service')
const manifestService = require('./lib/manifest-service')

filesService.getSetDefinitions()
  .catch(err => {
    console.error(err)
  })
  .then(files => {
    return Promise.all(
      files.map(f =>
        manifestService.getSongManifest(f)
          .then(manifest => manifestService.getSongMetadata(manifest))
      )
    )
  })
  .then(metas => {
    const metasByDir = groupBy(metas, m => m.dir)
    each(metasByDir, (files, dir) => {
      console.log(`-- :: ${dir} :: --`)

      each(files, file => {
        console.log(file.title, file.author, file.comments || '')
      })
    })
  })
