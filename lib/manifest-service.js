const fs = require('fs')
const path = require('path')
const readline = require('readline')
const iconv = require('iconv-lite')
const logger = require('./logging-service')
const lib = {}

/**
 *  Gets song manifest path from a set definition
 */
lib.getSongManifest = setdef => {
  return new Promise(resolve => {
    const meta = {}
    const decoderstream = iconv.decodeStream('SHIFTJIS')
    const rl = readline.createInterface({
      input: decoderstream
    })

    fs.createReadStream(setdef).pipe(decoderstream)

    rl.on('line', line => {
      let match

      // :: check for DTX song name
      if ((match = /^#TITLE[\s:]*(.*)$/.exec(line))) {
        meta.title = match[1]
        return
      }

      // :: check for DTX definition file
      if ((match = /^#L\d*FILE\s*:\s*(.*)$/.exec(line))) {
        meta.manifest = match[1]
      }
    })

    rl.on('close', _ =>
      resolve({
        title: meta.title,
        manifest: setdef.replace('set.def', meta.manifest)
      })
    )
  })
}

/**
 *  Get song metadata from a DTX manifest
 */
lib.getSongMetadata = ({ title, manifest }) => {
  return new Promise(resolve => {
    const meta = {
      title,
      dir: path.relative('./', path.resolve(manifest, '../..'))
    }
    const decoderstream = iconv.decodeStream('SHIFTJIS')
    const rl = readline.createInterface({
      input: decoderstream
    })

    fs.createReadStream(manifest).pipe(decoderstream)

    rl.on('line', line => {
      let match

      //  :: check for author
      if ((match = /^#ARTIST[\s:]*(.*)$/.exec(line))) {
        meta.author = match[1]
        return
      }

      // :: check for comments
      if ((match = /^COMMENT[S\s:]*(.*)$/.exec(line))) {
        meta.comments = match[1]
      }
    })

    rl.on('close', _ => resolve(meta))
  })
}

module.exports = lib
