const { log } = require('../gamecommon')
const db = require('../../db/db')
const cargo = require('../basics/cargo')

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

    // update guilds
    const updates = this.guilds.map(async (guild) => {
      await guild.stepUpdate()
    })
    await Promise.all(updates)
    log('update', `Updated all ${this.guilds.length} ships`)

    // expire old caches
    const cacheCutoff = Date.now() - cacheExpirationTime
    const deletedCacheCount = 0
    this.caches.forEach((cache) => {
      if (
        cache.created < cacheCutoff &&
        this.caches.length > this.gameDiameter() / 2
      ) {
        this.deleteCache(cache.id)
        deletedCacheCount++
      }
    })
    if (deletedCacheCount)
      log('update', `Removed ${deletedCacheCount} expired caches`)

    // spawn caches randomly
    if (this.caches.length <= this.gameDiameter() / 2 && Math.random() > 0.9) {
      let amount = Math.ceil(Math.random() * 40 + 3)
      this.spawnCache({
        location: [
          Math.random() * this.gameDiameter() - this.gameDiameter() / 2,
          Math.random() * this.gameDiameter() - this.gameDiameter() / 2,
        ],
        type: Object.keys(cargo)[
          Math.floor(Math.random() * Object.keys(cargo).length)
        ],
        amount: amount,
      })
    }
  },
}
