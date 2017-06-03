const fs = require('fs')
const path = require('path')
const readline = require('readline')
const iconv = require('iconv-lite')

const first = require('lodash/first')

const logger = require('./logging-service')
const lib = {}

/**
 *  Gets song manifest path from a set definition
 */
lib.getSongManifest = setdef => {
  return new Promise(resolve => {
    const meta = { manifest: [] }
    const decoderstream = iconv.decodeStream('SHIFTJIS')
    const rl = readline.createInterface({
      input: decoderstream
    })

    fs.createReadStream(setdef).pipe(decoderstream)

    rl.on('line', line => {
      let match

      // :: check for DTX song name
      if ((match = /^#TITLE[\s:]*(.*)$/.exec(line))) {
        if (!match[1]) return
        meta.title = match[1]
        return
      }

      // :: check for DTX definition file
      if ((match = /^#L\d*FILE[\s:]*(.*)$/.exec(line))) {
        if (!match[1]) return
        meta.manifest.push(match[1])
      }
    })

    rl.on('close', _ =>
      resolve({
        title: meta.title,
        manifest: meta.manifest.map(m => setdef.replace('set.def', m))
      })
    )
  })
}

/**
 *  Get song metadata from a DTX manifest
 */
lib.getSongMetadata = ({ title, manifest }) => {
  return new Promise((resolve, reject) => {

    const manifests = manifest.filter(f => fs.existsSync(f))
    const targetFile = manifests[0]

    if (!targetFile) return reject('No valid file found.')

    const meta = {
      title,
      dir: path.relative('./', path.resolve(targetFile, '../..'))
    }
    const decoderstream = iconv.decodeStream('SHIFTJIS')
    const rl = readline.createInterface({
      input: decoderstream
    })

    // :: failsafe
    fs.createReadStream(targetFile).pipe(decoderstream)

    rl.on('line', line => {
      let match

      //  :: check for author
      if ((match = /^#ARTIST[\s:]*(.*)$/.exec(line))) {
        if (!match[1]) return
        meta.author = match[1]
        return
      }

      // :: check for comments
      if ((match = /^#COMMENT[\s:]*(.*)$/.exec(line))) {
        if (!match[1]) return
        meta.comments = match[1]
      }
    })

    rl.on('close', _ => resolve(meta))
  })
}

module.exports = lib
