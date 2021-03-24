const { log } = require(`../gamecommon`)
const cargo = require(`../basics/cargo`)

const cacheExpirationTime = TICK_INTERVAL * 60 * 1000
const attackRemnantExpirationTime = TICK_INTERVAL * 60 * 60
let tickInterval, mediumInterval, slowInterval

module.exports = {
  async start() {
    log(`init`, `Starting game`)
    this.lastTick = Date.now()

    if (tickInterval) clearInterval(tickInterval)
    if (mediumInterval) clearInterval(mediumInterval)
    if (slowInterval) clearInterval(slowInterval)

    tickInterval = setInterval(async () => {
      await this.tick()
    }, TICK_INTERVAL)

    mediumInterval = setInterval(async () => {
      await this.medium()
    }, MEDIUM_INTERVAL)

    slowInterval = setInterval(async () => {
      await this.slow()
    }, SLOW_INTERVAL)
  },

  async tick() {
    this.lastTick = Date.now()

    // update guilds
    const updates = this.guilds
      .filter((g) => g.active)
      .map(async (guild) => {
        await guild.stepUpdate()
      })
    await Promise.all(updates)
    // log(`update`, `Updated all ${this.guilds.length} ships`)
  },

  async medium() {
    // expire old attack remnants
    const attackRemnantCutoff = Date.now() - attackRemnantExpirationTime
    let deletedAttackRemnantCount = 0
    for (let attackRemnantIndex in this.attackRemnants) {
      const attackRemnant = this.attackRemnants[attackRemnantIndex]
      if (attackRemnant && attackRemnant.time < attackRemnantCutoff) {
        this.deleteAttackRemnant(attackRemnant.id)
        deletedAttackRemnantCount++
      }
    }
    if (deletedAttackRemnantCount) {
      log(
        `update`,
        `Removed ${deletedAttackRemnantCount} expired attackRemnants`,
      )
    }

    // spawn caches randomly
    if (this.caches.length <= this.gameDiameter() / 4 && Math.random() < 0.5) {
      const amount = Math.ceil(Math.random() * 40 + 3) * 100
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
      log(`update`, `Spawned a cache`)
    }
  },

  async slow() {
    // expire old caches
    const cacheCutoff = Date.now() - cacheExpirationTime
    let deletedCacheCount = 0
    this.caches.forEach((cache) => {
      if (
        cache.created < cacheCutoff &&
        this.caches.length > this.gameDiameter() / 2
      ) {
        this.deleteCache(cache.id)
        deletedCacheCount++
      }
    })
    if (deletedCacheCount) {
      log(`update`, `Removed ${deletedCacheCount} expired caches`)
    }

    this.save()
  },

  async save() {
    log(``, `============= SAVING GAME =============`)
    const updates = this.guilds.map(async (guild) => {
      await guild.saveToDb()
    })
    await Promise.all(updates)
  },
}
