const fs = require('fs')
const readline = require('readline')
const iconv = require('iconv-lite')
const lib = {}

/**
 *  Gets song metadata from a set definition
 */
lib.getSongMetadata = setdef => {
  return new Promise((resolve, reject) => {
    const meta = {}
    const decoderstream = iconv.decodeStream('SHIFTJIS')
    const rl = readline.createInterface({
      input: decoderstream
    })

    fs.createReadStream(setdef).pipe(decoderstream)

    rl.on('line', line => {
      // :: check for DTX song name
      if (match = /^#TITLE[\s:]*(.*)$/.exec(line)) {
        meta.title = match[1]
      }

      // :: check for DTX definition file
      if (match = /^#L\d*FILE\s*:\s*(.*)$/.exec(line)) {
        meta.manifest = match[1]
      }
    })

    rl.on('close', _ => resolve({
      title: meta.title,
      manifest: setdef.replace('set.def', meta.manifest)
    }))
  })
}

module.exports = lib
