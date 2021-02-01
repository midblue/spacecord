const guild = require('./basics/guild/guild')
const story = require('./basics/story/story')
const { log } = require('./gamecommon')
const { pointIsInsideCircle } = require('../common')
const coreLoop = require('./core loop/index')

/* 
---------------- Game Object ----------------
This object is our "instance" of the game that will handle updates,
the core loop, etc.
*/

const game = {
  // ---------------- Game Properties ----------------
  guilds: [],
  startTime: new Date(),
  lastTick: new Date(),

  // ---------------- Game Loop Functions ----------------

  ...coreLoop,

  // ---------------- Game Functions ----------------

  timeUntilNextTick() {
    const currentTickProgress = Date.now() - this.lastTick
    return process.env.STEP_INTERVAL - currentTickProgress
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
        'Attempted to add a guild that already exists in the game',
      )
      return {
        ok: false,
        message: story.ship.get.fail.existing(existingGuildInGame),
        guild: existingGuildInGame,
      }
    }

    // success
    newGuild.context = this // gives access to game context
    this.guilds.push(newGuild)
    log('addGuild', 'Added guild to game', newGuild.guildName)
    return {
      ok: true,
      message: story.ship.get.first(newGuild),
      guild: newGuild,
    }
  },

  getGuild(id) {
    const thisGuild = this.guilds.find((g) => g.guildId === id)
    if (!thisGuild) {
      log('guildStatus', `Attempted to get a guild that does not exist`, id)
      return {
        ok: false,
        message: story.guild.get.fail.noGuild(),
      }
    }
    return {
      ok: true,
      ...thisGuild,
    }
  },

  scanArea({ x, y, range, excludeIds = [] }) {
    if (!Array.isArray(excludeIds)) excludeIds = [excludeIds]
    return this.guilds.filter((g) => {
      return (
        !excludeIds.includes(g.guildId) &&
        pointIsInsideCircle(x, y, ...g.ship.location, range)
      )
    })
  },
}

game.start()

/* 
---------------- Exports ----------------
These functions are the bridge between discord and the game — 
they provide an interface to game functions and handle conversions 
from discord types to game types, and vice versa.

*/
module.exports = {
  async spawn({ discordGuild, channelId }) {
    const newGuild = await guild({ discordGuild, channelId })
    return game.addGuild(newGuild)
  },
  guild(guildId) {
    return game.getGuild(guildId)
  },
  timeUntilNextTick() {
    return game.timeUntilNextTick()
  },
}
