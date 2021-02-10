const { log } = require('../gamecommon')
const db = require('../../db/db')

const cacheExpirationTime = process.env.STEP_INTERVAL * 500

module.exports = {
  async start() {
    log('init', 'Starting game')
    this.lastTick = Date.now()

    setInterval(async () => {
      console.log('')
      log('', '============= NEW GAME STEP =============')
      await this.update()
      log('', '============= END GAME STEP =============')
      console.log('')
    }, process.env.STEP_INTERVAL)
  },

  async update() {
    this.lastTick = Date.now()

    const updates = this.guilds.map(async (guild) => {
      await guild.stepUpdate()
    })
    await Promise.all(updates)
    log('update', `Updated all ${this.guilds.length} ships`)

    const cacheCutoff = Date.now() - cacheExpirationTime
    const deletedCacheCount = 0
    this.caches.forEach((cache) => {
      if (cache.created < cacheCutoff) {
        this.deleteCache(cache.id)
        deletedCacheCount++
      }
    })
    if (deletedCacheCount)
      log('update', `Removed ${deletedCacheCount} expired caches`)

    // todo spawn caches randomly with goodies
  },
}
