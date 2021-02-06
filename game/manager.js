const { spawn, liveify } = require('./basics/guild/guild')
const spawnPlanets = require('./basics/planets')
const story = require('./basics/story/story')
const { log } = require('./gamecommon')
const { pointIsInsideCircle } = require('../common')
const coreLoop = require('./core loop/index')
const db = require('../db/db')

/* 
---------------- Game Object ----------------
This object is our "instance" of the game that will handle updates,
the core loop, etc.
*/

const game = {
  async init() {
    ;(await db.guild.getAll()).forEach((g) => this.loadExistingGuild(g))
    log('init', `Loaded ${this.guilds.length} guilds from db`)

    this.planets = await spawnPlanets({ context: this })
    log('init', `Loaded ${this.planets.length} planets`)

    this.start()
  },

  // ---------------- Game Properties ----------------
  guilds: [],
  planets: [],
  npcs: [],
  startTime: new Date(),
  lastTick: new Date(),

  // ---------------- Game Loop Functions ----------------

  ...coreLoop,

  // ---------------- Game Functions ----------------

  timeUntilNextTick() {
    const currentTickProgress = Date.now() - this.lastTick
    return process.env.STEP_INTERVAL - currentTickProgress
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
      log('addGuild', 'Attempted to add nonexistent guild')
      return { ok: false, message: 'Attempted to add nonexistent guild' }
    }
    const existingGuildInGame = this.guilds.find(
      (g) => g.guildId === newGuild.guildId,
    )
    if (existingGuildInGame) {
      log(
        'addGuild',
        'Attempted to spawn a guild that already exists in the game',
      )
      return {
        ok: false,
        message: story.ship.get.fail.existing(existingGuildInGame),
        guild: existingGuildInGame,
      }
    }

    // success
    this.guilds.push(newGuild)
    log('addGuild', 'Added guild to game', newGuild.guildName)
    return {
      ok: true,
      message: story.ship.get.first(newGuild),
      guild: newGuild,
    }
  },

  async removeGuild(guildId) {
    if (!guildId) {
      return { ok: false, message: 'missing id' }
    }
    const existingGuildInGame = this.guilds.findIndex(
      (g) => g.guildId === guildId,
    )
    if (existingGuildInGame === -1) {
      return {
        ok: false,
        message: 'no such guild',
      }
    }
    // success
    this.guilds.splice(existingGuildInGame, 1)
    await db.guild.remove(guildId)
    return {
      ok: true,
      message: 'deleted guild',
    }
  },

  async getGuild(id) {
    let thisGuild = this.guilds.find((g) => g.guildId === id) // check local
    if (!thisGuild) {
      thisGuild = await db.guild.get({ guildId: id })
      if (thisGuild) {
        liveify(thisGuild, this)
        this.guilds.push(thisGuild)
      }
    }

    if (!thisGuild) {
      log('guildStatus', `Attempted to get a guild that does not exist`, id)
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

  scanArea({ x, y, range, excludeIds = [] }) {
    if (!Array.isArray(excludeIds)) excludeIds = [excludeIds]
    return {
      guilds: this.guilds.filter((g) => {
        return (
          !excludeIds.includes(g.guildId) &&
          pointIsInsideCircle(x, y, ...g.ship.location, range)
        )
      }),
      planets: this.planets.filter((p) =>
        pointIsInsideCircle(x, y, ...p.location, range),
      ),
    }
  },

  broadcast({ x, y, range, message, logMessage, excludeIds = [] }) {
    const guildsInRangeToHear = this.scanArea({ x, y, range, excludeIds })
      .guilds
    guildsInRangeToHear.forEach((g) => {
      g.pushToGuild(message)
      g.ship.logEntry(logMessage)
    })
  },
}

game.init()

/* 
---------------- Exports ----------------
These functions are the bridge between discord and the game — 
they provide an interface to game functions and handle conversions 
from discord types to game types, and vice versa.

*/
module.exports = {
  async spawn({ discordGuild, channelId }) {
    const existingGuildInDb = await game.getGuild(discordGuild.id)
    if (existingGuildInDb.ok)
      return {
        ...existingGuildInDb,
        ok: false,
        message: story.ship.get.fail.existing(existingGuildInDb.guild),
      }

    const newGuild = await spawn({ discordGuild, channelId, context: game })
    if (!newGuild)
      return { ok: false, message: 'This guild has been banned from the game.' }
    return game.addGuild(newGuild)
  },
  async guild(guildId) {
    return await game.getGuild(guildId)
  },
  async guilds() {
    return game.guilds
  },
  async removeGuild(guildId) {
    return await game.removeGuild(guildId)
  },
  tick() {
    return game.update()
  },
  timeUntilNextTick() {
    return game.timeUntilNextTick()
  },
}
