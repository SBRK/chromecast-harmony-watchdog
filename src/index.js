const _ = require('lodash')

const { watchChromecast } = require('./chromecast')
const { getActivity } = require('./harmony')

const config = {
  activity: {
    name: 'Chromecast',
  },
  chromecast: {
    name: 'TV du salon',
  }
}

const chromecastName = _.get(config, ['chromecast', 'name'])
const activityName = _.get(config, ['activity', 'name'])

const chromecastChangeHandler = async (name, streaming) => {
  try {
    const harmonyChromecastActivity = await getActivity(activityName)

    if (streaming) {
      console.log(`Chromecast ${chromecastName} streaming`)
      // Start activity
      harmonyChromecastActivity.start()
    } else {
      console.log(`Chromecast ${chromecastName} streaming stopped`)
      // Stop activity
      harmonyChromecastActivity.stop()
    }
  } catch (err) {
    console.error(err)
  }
}

watchChromecast(chromecastName, chromecastChangeHandler)
console.log('Watcher started')
