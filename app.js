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
    metas.forEach(m => {
      console.log(m.title, m.author, m.dir)
    })
  })
