const { spawn: spawnNewGuildData, liveify } = require(`./basics/guild/guild`)
const spawnPlanets = require(`./basics/planet`).spawnAll
const caches = require(`./basics/caches`)
const story = require(`./basics/story/story`)
const { log } = require(`./gamecommon`)
const { pointIsInsideCircle, distance } = require(`../common`)
const coreLoop = require(`./core loop/`)

//
// ---------------- Game Object ----------------
// this object is our "instance" of the game that will handle updates,
// the core loop, etc.
//
// ---------------- Exports ----------------
// these functions are the bridge between discord and the game —
// they provide an interface to game functions and handle conversions
// from discord types to game types, and vice versa.
//

const game = {
  async init(db) {
    this.db = db

    const guilds = await db.guild.getAll()
    this.guilds = []
    guilds.forEach((g) => this.loadExistingGuild(g))
    log(`init`, `Loaded ${this.guilds.length} guilds from db`)

    const caches = await db.cache.getAll()
    this.caches = []
    caches.forEach((c) => this.loadCache(c))
    log(`init`, `Loaded ${this.caches.length} caches from db`)

    this.attackRemnants = await db.attackRemnant.getAll()
    log(`init`, `Loaded ${this.attackRemnants.length} attack remnants from db`)

    this.planets = await spawnPlanets({ context: this })
    log(`init`, `Loaded ${this.planets.length} planets`)

    this.isReady = true
    this.start()
    log(`init`, `================ Game Init Complete ================`)
  },

  // ---------------- Game Properties ----------------

  db: {},
  isReady: false,
  gameDiameter: () => {
    return Math.sqrt(this.guilds?.length || 1) * 2
  },
  guilds: [],
  caches: [],
  planets: [],
  attackRemnants: [],
  startTime: Date.now(),
  lastTick: Date.now(),

  // ---------------- Game Loop Functions ----------------

  ...coreLoop,

  // ---------------- Game Functions ----------------

  async export() {
    const guilds = this.guilds.map((g) => g.saveableData()),
      planets = this.planets.map((p) => p.saveableData()),
      caches = this.caches,
      attackRemnants = this.attackRemnants
    return {
      startTime: this.startTime,
      gameDiameter: this.gameDiameter,
      guilds,
      caches,
      planets,
      attackRemnants,
    }
  },

  loadCache(cache) {
    caches.liveify(cache)
    this.caches.push(cache)
  },

  loadExistingGuild(guild) {
    liveify(guild, this)
    this.guilds.push(guild)
    return {
      ok: false,
      message: story.ship.get.fail.existing(guild),
      guild: guild,
    }
  },

  addGuild(newGuild) {
    if (!newGuild) {
      log(`addGuild`, `Attempted to add nonexistent guild`)
      return {
        ok: false,
        message: `Attempted to add nonexistent guild`,
      }
    }
    const existingGuildInGame = this.guilds.find((g) => g.id === newGuild.id)
    if (existingGuildInGame) {
      log(
        `addGuild`,
        `Attempted to spawn a guild that already exists in the game`,
      )
      return {
        ok: false,
        message: story.ship.get.fail.existing(existingGuildInGame),
        guild: existingGuildInGame,
      }
    }

    // success
    this.guilds.push(newGuild)
    log(`addGuild`, `Added guild to game`, newGuild.name, newGuild.id)
    // console.log(`newGuild`, newGuild)
    return {
      ok: true,
      message: story.ship.get.first(newGuild),
      guild: newGuild,
    }
  },

  async removeGuild(id) {
    if (!id) {
      return { ok: false, message: `missing id` }
    }
    const existingGuildInGame = this.guilds.findIndex((g) => g.id === id)
    if (existingGuildInGame === -1) {
      return {
        ok: false,
        message: `no such guild`,
      }
    }
    // success
    this.guilds.splice(existingGuildInGame, 1)
    const res = await this.db.guild.remove(id)
    return res
  },

  async guild(id) {
    let thisGuild = this.guilds.find((g) => g.id === id) // check local
    if (!thisGuild) {
      thisGuild = await this.db.guild.get({ id: id })
      if (thisGuild) {
        liveify(thisGuild, this)
        this.guilds.push(thisGuild)
      }
    }

    if (!thisGuild) {
      log(`guildStatus`, `Unable to find guild in db:`, id)
      return {
        ok: false,
        message: story.guild.get.fail.noGuild(),
      }
    }
    return {
      ok: true,
      guild: thisGuild,
    }
  },

  scanArea({ x, y, range, excludeIds = [], type }) {
    if (!Array.isArray(excludeIds)) excludeIds = [excludeIds]
    return {
      guilds:
        !type || type === `guilds`
          ? this.guilds.filter(
              (g) =>
                !g.ship.status.dead &&
                !excludeIds.includes(g.id) &&
                pointIsInsideCircle(x, y, ...g.ship.location, range),
            )
          : [],
      planets:
        !type || type === `planets`
          ? this.planets.filter((p) =>
              pointIsInsideCircle(x, y, ...p.location, range),
            )
          : [],
      caches:
        !type || type === `caches`
          ? this.caches.filter((c) =>
              pointIsInsideCircle(x, y, ...c.location, range),
            )
          : [],
      attackRemnants:
        !type || type === `attackRemnants`
          ? this.attackRemnants.filter(
              (c) =>
                pointIsInsideCircle(x, y, ...c.attacker.location, range) ||
                pointIsInsideCircle(x, y, ...c.defender.location, range),
            )
          : [],
    }
  },

  broadcast({
    x,
    y,
    range,
    message,
    excludeIds = [],
    garbleAmount,
    messageProps,
  }) {
    const guildsInRangeToHear =
      this.scanArea({
        x,
        y,
        range,
        excludeIds,
      }).guilds || []
    guildsInRangeToHear.forEach((g) => {
      const d = distance(x, y, ...g.ship.location)
      const dPercent = d / range
      const garb = garbleAmount * dPercent
      const m = message(...messageProps, garb)
      g.message(m)
      // g.ship.logEntry(m)
    })
    return guildsInRangeToHear
  },

  async spawnCache(cacheData) {
    const cacheDataToSave = { ...cacheData, created: Date.now() }
    const savedCache = await this.db.cache.add(cacheDataToSave)
    caches.liveify(cacheDataToSave)
    cacheDataToSave.id = savedCache._id || savedCache.id
    this.caches.push(cacheDataToSave)
    return cacheDataToSave
  },
  async deleteCache(cacheId) {
    this.caches.splice(
      this.caches.findIndex((c) => c.id === cacheId),
      1,
    )
    await this.db.cache.remove(cacheId)
    return { ok: true }
  },

  async spawnAttackRemnant(attackRemnantData) {
    const attackRemnantDataToSave = { ...attackRemnantData, time: Date.now() }
    const savedRemnant = await this.db.attackRemnant.add(
      attackRemnantDataToSave,
    )
    attackRemnantDataToSave.id = savedRemnant._id || savedRemnant.id
    this.attackRemnants.push(attackRemnantDataToSave)
  },
  async deleteAttackRemnant(attackRemnantId) {
    this.attackRemnants.splice(
      this.attackRemnants.findIndex((c) => c.id === attackRemnantId),
      1,
    )
    this.db.attackRemnant.remove(attackRemnantId)
    return { ok: true }
  },

  async spawn({ discordGuild, channelId }) {
    const existingGuildInDb = await this.guild(discordGuild.id)
    if (existingGuildInDb.ok) {
      return {
        ...existingGuildInDb,
        ok: false,
        message: story.ship.get.fail.existing(existingGuildInDb.guild),
      }
    }
    const newGuild = await spawnNewGuildData({
      db: this.db,
      discordGuild,
      channelId,
      context: this,
    })

    if (!newGuild) {
      return {
        ok: false,
        message: `This guild has been banned from the game.`,
      }
    }
    return this.addGuild(newGuild)
  },

  verifyActiveGuilds(discordGuilds) {
    setTimeout(() => {
      this.guilds.forEach((g) => {
        if (!discordGuilds.find((discordGuild) => discordGuild.id === g.id)) {
          this.deactivateGuild(g.id)
          log(`verifyActive`, `Deactivating`, g.id, `: not in server anymore`)
        }
      })
    }, 3000)
  },

  async activateGuild(id) {
    const existing = await this.db.guild.get({ id })
    if (existing) {
      await this.db.guild.update({
        id,
        updates: { active: true },
      })
      existing.active = true
      this.loadExistingGuild(existing)
      return true
    }
    return false
  },
  async deactivateGuild(id) {
    // intentionally not removing them from the game just so other players can still kill them
    await this.db.guild.update({
      id,
      updates: { active: false },
    })
  },
}

// ------------------- handle process end ---------------
// const exitHandler = async () => {
//   const savePromises = game.guilds.map(async (g) => await g.save())
//   log(`exitHandler`, `Saving ${savePromises.length} guilds...`)
//   await Promise.all(savePromises)
//   log(`exitHandler`, `Saved!`)
//   process.exit()
// }
// // catches ctrl+c event
// process.on(`SIGINT`, exitHandler)
// // catches "kill pid" (for example: nodemon restart)
// process.on(`SIGUSR1`, exitHandler)
// // process.on(`SIGUSR2`, exitHandler)
// // catches uncaught exceptions
// process.on(`uncaughtException`, exitHandler)

module.exports = game
