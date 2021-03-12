const { log } = require(`../gamecommon`)

const cargo = require(`../basics/cargo`)

const cacheExpirationTime = TICK_INTERVAL * 500
let loopInterval, saveInterval

module.exports = {
  async start() {
    log(`init`, `Starting game`)
    this.lastTick = Date.now()

    if (loopInterval) clearInterval(loopInterval)
    if (saveInterval) clearInterval(saveInterval)
    loopInterval = setInterval(async () => {
      // console.log(``)
      // log(``, `============= NEW GAME STEP =============`)
      await this.update()
      // log(``, `============= END GAME STEP =============`)
      // console.log(``)
    }, TICK_INTERVAL)

    saveInterval = setInterval(async () => {
      console.log(``)
      log(``, `============= SAVING GAME =============`)
      await this.save()
      console.log(``)
    }, SAVE_INTERVAL)
  },

  async update() {
    this.lastTick = Date.now()

    // update guilds
    const updates = this.guilds.map(async (guild) => {
      await guild.stepUpdate()
    })
    await Promise.all(updates)
    // log(`update`, `Updated all ${this.guilds.length} ships`)

    // // expire old caches
    // const cacheCutoff = Date.now() - cacheExpirationTime
    // let deletedCacheCount = 0
    // this.caches.forEach((cache) => {
    //   if (
    //     cache.created < cacheCutoff &&
    //     this.caches.length > this.gameDiameter() / 2
    //   ) {
    //     this.deleteCache(cache.id)
    //     deletedCacheCount++
    //   }
    // })
    // if (deletedCacheCount) {
    //   log(`update`, `Removed ${deletedCacheCount} expired caches`)
    // }

    // // spawn caches randomly
    // if (this.caches.length <= this.gameDiameter() / 2 && Math.random() > 0.9) {
    //   const amount = Math.ceil(Math.random() * 40 + 3)
    //   this.spawnCache({
    //     location: [
    //       math.random() * this.gameDiameter() - this.gameDiameter() / 2,
    //       math.random() * this.gameDiameter() - this.gameDiameter() / 2,
    //     ],
    //     type: Object.keys(cargo)[
    //       math.floor(Math.random() * Object.keys(cargo).length)
    //     ],
    //     amount: amount,
    //   })
    // }
  },

  async save() {
    const updates = this.guilds.map(async (guild) => {
      await guild.saveNewDataToDb()
    })
    await Promise.all(updates)
  },
}
