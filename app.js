const filesService = require('./lib/files-service')
const manifestService = require('./lib/manifest-service')

filesService.getSetDefinitions()
  .catch(err => {
    console.error(err)
  })
  .then(files => {
    const file = files[0]
    return Promise.all(
      files.map(f => manifestService.getSongMetadata(f))
    )
  })
  .then(metas => {
    metas.forEach(m => {
      console.log(m.title, m.manifest)
    })
  })
