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
//

module.exports = {
  async init (db) {
    this.db = db
    // const demoGuild = await require(`./basics/guild/createDefaultGuild`)({
    //   discordGuild: { name: `testGuild`, id: `testGuildId` },
    //   channelId: `testChannel`
    // })

    // const guilds = await db.guilds.getAll()
    // guilds.forEach((g) =>
    //   this.loadExistingGuild(g))
    // log(`init`, `Loaded ${this.guilds.length} guilds from db`)

    // const caches = await db.caches.getAll()
    // caches.forEach((c) => this.loadCache(c))
    // log(`init`, `Loaded ${this.caches.length} caches from db`)

    // this.planets = await spawnPlanets({ context: this.game })
    // log(`init`, `Loaded ${this.planets.length} planets`)

    this.isReady = true
    this.start()
    log(`init`, `Init complete`)
  },


  // ---------------- Game Properties ----------------
  db: {},
  isReady: false,
  gameDiameter: () => {
    return Math.sqrt(this.guilds?.length || 1) * 15
  },
  guilds: [],
  caches: [],
  planets: [],
  npcs: [],
  startTime: Date.now(),
  lastTick: Date.now(),

  // ---------------- Game Loop Functions ----------------

  ...coreLoop,

  // ---------------- Game Functions ----------------

  timeUntilNextTick () {
    const currentTickProgress = Date.now() - this.lastTick
    return STEP_INTERVAL - currentTickProgress
  },

  loadCache (cache) {
    caches.liveify(cache)
    this.caches.push(cache)
  },

  loadExistingGuild (guild) {
    liveify(guild, this)
    this.guilds.push(guild)
    return {
      ok: false,
      message: story.ship.get.fail.existing(guild),
      guild: guild
    }
  },

  addGuild (newGuild) {
    if (!newGuild) {
      log(`addGuild`, `Attempted to add nonexistent guild`)
      return { ok: false, message: `Attempted to add nonexistent guild` }
    }
    const existingGuildInGame = this.guilds.find(
      (g) => g.guildId === newGuild.guildId
    )
    if (existingGuildInGame) {
      log(
        `addGuild`,
        `Attempted to spawn a guild that already exists in the game`
      )
      return {
        ok: false,
        message: story.ship.get.fail.existing(existingGuildInGame),
        guild: existingGuildInGame
      }
    }

    // success
    this.guilds.push(newGuild)
    log(`addGuild`, `Added guild to game`, newGuild.guildName)
    // console.log(`newGuild`, newGuild)
    return {
      ok: true,
      message: story.ship.get.first(newGuild),
      guild: newGuild
    }
  },

  async removeGuild (guildId) {
    if (!guildId) {
      return { ok: false, message: `missing id` }
    }
    const existingGuildInGame = this.guilds.findIndex(
      (g) => g.guildId === guildId
    )
    if (existingGuildInGame === -1) {
      return {
        ok: false,
        message: `no such guild`
      }
    }
    // success
    this.guilds.splice(existingGuildInGame, 1)
    await db.guilds.remove(guildId)
    return {
      ok: true,
      message: `deleted guild`
    }
  },

  async getGuild (id) {
    let thisGuild = this.guilds.find((g) => g.guildId === id) // check local
    if (!thisGuild) {
      thisGuild = await this.db.guilds.get({ guildId: id })
      if (thisGuild) {
        liveify(thisGuild, this)
        this.guilds.push(thisGuild)
      }
    }

    if (!thisGuild) {
      log(`guildStatus`, `Attempted to get a guild that does not exist`, id)
      return {
        ok: false,
        message: story.guild.get.fail.noGuild()
      }
    }
    return {
      ok: true,
      guild: thisGuild
    }
  },

  scanArea ({ x, y, range, excludeIds = [], type }) {
    if (!Array.isArray(excludeIds))
      excludeIds = [excludeIds]
    return {
      guilds: (!type || type === `guilds`)
        ? this.guilds.filter((g) => {
          return (
            !g.ship.status.dead &&
            !excludeIds.includes(g.guildId) &&
            pointIsInsideCircle(x, y, ...g.ship.location, range)
          )
        })
        : [],
      planets: (!type || type === `planets`)
        ? this.planets.filter((p) =>
          pointIsInsideCircle(x, y, ...p.location, range)
        )
        : [],
      caches: (!type || type === `caches`)
        ? this.caches.filter((c) =>
          pointIsInsideCircle(x, y, ...c.location, range)
        )
        : []
    }
  },

  broadcast ({
    x,
    y,
    range,
    message,
    excludeIds = [],
    garbleAmount,
    messageProps
  }) {
    const guildsInRangeToHear = this.scanArea({ x, y, range, excludeIds })
      .guilds
    guildsInRangeToHear.forEach((g) => {
      const d = distance(x, y, ...g.ship.location)
      const dPercent = d / range
      const garb = garbleAmount * dPercent
      const m = message(...messageProps, garb)
      g.pushToGuild(m)
      g.ship.logEntry(m)
    })
  },

  spawnCache (cacheData) {
    const cacheDataToSave = { ...cacheData, created: Date.now() }
    db.caches.add({ ...cacheData, created: Date.now() })
    caches.liveify(cacheDataToSave)
    this.caches.push(cacheDataToSave)
  },
  deleteCache (cacheId) {
    db.caches.remove(cacheId)
    this.caches.splice(
      this.caches.findIndex((c) => c.id === cacheId),
      1
    )
    return { ok: true }
  },

  async spawn ({ discordGuild, channelId }) {
    const existingGuildInDb = await this.getGuild(discordGuild.id)
    if (existingGuildInDb.ok) {
      return {
        ...existingGuildInDb,
        ok: false,
        message: story.ship.get.fail.existing(existingGuildInDb.guild)
      }
    }
    const newGuild = await spawnNewGuildData({ db: this.db, discordGuild, channelId, context: this })
    if (!newGuild) { return { ok: false, message: `This guild has been banned from the game.` } }
    return this.addGuild(newGuild)
  },
  async guild (guildId) {
    return await this.getGuild(guildId)
  },
  verifyActiveGuilds (discordGuilds) {
    setTimeout(() => {
      this.guilds.forEach((g) => {
        if (
          !discordGuilds.find((discordGuild) => discordGuild.id === g.guildId)
        ) {
          this.deactivateGuild(g.guildId)
          log(
            `verifyActive`,
            `Deactivating`,
            g.guildId,
            `: not in server anymore`
          )
        }
      })
    }, 3000)
  },
  async activateGuild (guildId) {
    const existing = await db.guilds.get({ guildId })
    if (existing) {
      await db.guilds.update({ guildId, updates: { active: true } })
      existing.active = true
      this.loadExistingGuild(existing)
      return true
    } return false
  },
  async deactivateGuild (guildId) {
    // intentionally not removing them from the game just so other players can still kill them
    await db.guilds.update({ guildId, updates: { active: false } })
  },

  tick () {
    return this.update()
  },
}
