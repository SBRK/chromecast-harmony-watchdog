const chromecastDiscover = require('chromecast-discover').default
const _ = require('lodash')

const chromecasts = []
const watchers = []

let started = false

const startIfNeeded = () => {
  if (started) {
    return
  }

  chromecastDiscover.on('online', (data) => {
    const {
      friendlyName: name = '',
      streaming = '0',
    } = data

    let chromecast = _.find(chromecasts, { name })

    if (!chromecast) {
      chromecast = {
        name,
        streaming: false,
      }

      chromecasts.push(chromecast)
    }

    const newStreaming = streaming === '1'

    if (chromecast.streaming !== newStreaming) {
      chromecast.streaming = newStreaming

      _.each(
        _.filter(watchers, { name }),
        ({ callback }) => { callback(name, newStreaming) }
      )
    }
  })

  chromecastDiscover.start()
  console.log('Watching chromecasts...')

  started = true
}

const watchChromecast = (name, callback) => {
  watchers.push({ name, callback })

  startIfNeeded()
  console.log(`Watching Chromecast ${name}...`)
}

module.exports = {
  watchChromecast,
}
