const fs = require('fs')
const readline = require('readline')
const iconv = require('iconv-lite')
const pickBy = require('lodash/pickBy')

const lib = {}

// :: ---

lib.getSongMetadata = (...songfiles) => new Promise((resolve, reject) => {
  const tasks = songfiles.map(processMetadata)

  Promise.all(tasks)
    .then(metadata => resolve(Object.assign({}, ...metadata.map(pickBy))))
})

// :: ---

function processMetadata (file) {
  const metadata = {
    group: file.directoryGroup
  }

  return new Promise((resolve, reject) => {
    const decoderstream = iconv.decodeStream('SHIFTJIS')
    const rl = readline.createInterface({ input: decoderstream })

    fs.createReadStream(file.basepath).pipe(decoderstream)

    rl.on('close', _ => {
      resolve(metadata)
    })

    rl.on('line', line => {
      if (matchLine(metadata, 'title', /^#TITLE[\s:]*(.*)$/, line)) return
      if (matchLine(metadata, 'author', /^#ARTIST[\s:]*(.*)$/, line )) return
      if (matchLine(metadata, 'comments', /^#COMMENT[\s:]*(.*)$/, line )) return
    })
  })
}

function matchLine (obj, key, regex, line) {
  let match
  if ((match = regex.exec(line))) {
    if (!match[1]) return false
    obj[key] = match[1]
    return true
  }

  return false
}

module.exports = lib
