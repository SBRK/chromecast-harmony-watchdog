const _ = require('lodash')
const Explorer = require('@harmonyhub/discover').Explorer
const HarmonyHubWS = require('harmonyhubws')

let currentHarmonyHub
let started = false

const discover = new Explorer(61991)

discover.on('online', ({ ip }) => {
  if (currentHarmonyHub) {
    return
  }

  const harmonyHub = new HarmonyHubWS(ip)

  harmonyHub.on('online', () => {
    if (currentHarmonyHub) {
      return
    }
    console.log('Connected to Harmony Hub')
    currentHarmonyHub = harmonyHub
  })

  harmonyHub.on('offline', () => {
    if (!currentHarmonyHub) {
      return
    }
    console.log('Lost connection to Harmony Hub !')
    currentHarmonyHub = null
  })
})

discover.start()

const getHarmonyHub = () => new Promise((resolve, reject) => {
  if (currentHarmonyHub) {
    resolve(currentHarmonyHub)
  }

  setTimeout(() => {
    if (currentHarmonyHub) {
      resolve(currentHarmonyHub)
    } else {
      reject('Can\'t find Harmony Hub')
    }
  }, t)
})

const getHarmonyHubConfig = () => new Promise(async resolve => {
  const harmonyHub = await getHarmonyHub()

  const timedOut = false
  const timeout = setTimeout(() => reject('Harmony Hub config timeout'), 15 * 1000)

  const configHandler = config => {
    if (timedOut) {
      return
    }

    if (timeout) {
      clearTimeout(timeout)
    }

    harmonyHub.off('config', configHandler)
    resolve(config)
  }

  harmonyHub.on('config', configHandler)
  harmonyHub.requestConfig()
})

const getActivity = label => new Promise(async (resolve, reject) => {
  const hub = await getHarmonyHub()
  const config = await getHarmonyHubConfig()

  const chromecastActivity = _.find(config.activity, { label })

  if (chromecastActivity) {
    const activityId = _.get(chromecastActivity, 'id')

    resolve({
      start: () => hub.requestActivityChange(activityId),
      stop: () => hub.requestActivityChange('-1')
    })
  } else {
    reject(new Error(`Could not find activity ${label}`))
  }
})

module.exports = {
  getActivity,
}
