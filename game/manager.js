const crewMember = require('./basics/crewMember')
const guild = require('./basics/guild/guild')
const story = require('./basics/story/story')
const { log } = require('./gamecommon')
const { pointIsInsideCircle } = require('../common')
const coreLoop = require('./core loop/index')
const constants = require('./basics/constants')

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
      }
    }

    // success
    newGuild.context = this // gives access to game context
    this.guilds.push(newGuild)
    log('addGuild', 'Added guild to game', newGuild.guildName)
    return { ok: true, message: story.ship.get.first(newGuild) }
  },

  addCrewMember({ newMember, guildId }) {
    const thisGuild = this.guilds.find((g) => g.guildId === guildId)
    if (!thisGuild) {
      log(
        'addCrew',
        `Attempted to add a member to a guild that doesn't exist in the game`,
        guildId,
      )
      return {
        ok: false,
        message: story.crew.add.fail.noShip(),
      }
    }
    if (thisGuild.ship.members.find((m) => m.id === newMember.id)) {
      log(
        'addCrew',
        `Attempted to add a member that already exists.`,
        newMember.id,
        thisGuild.id,
      )
      return {
        ok: false,
        message: story.crew.add.fail.existing(newMember.id),
      }
    }

    // success
    thisGuild.ship.members.push(newMember)
    log(
      'addCrew',
      'Added new member to guild',
      newMember.id,
      thisGuild.guildName,
    )
    if (thisGuild.ship.members.length === 1)
      return {
        ok: true,
        message: [
          story.crew.add.first(newMember, thisGuild),
          story.prompts.startGame(),
        ],
      }
    return { ok: true, message: story.crew.add.success(newMember, thisGuild) }
  },

  ship(id) {
    const thisGuild = this.guilds.find((g) => g.guildId === id)
    if (!thisGuild) {
      log(
        'guildStatus',
        `Attempted to get status for a guild that does not exist`,
        id,
      )
      return {
        ok: false,
        message: story.status.get.fail.noGuild(),
      }
    }
    return {
      ok: true,
      ...thisGuild.ship,
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
  async addCrewMember({ discordUser, guildId }) {
    const newMember = await crewMember(discordUser)
    return game.addCrewMember({ newMember, guildId })
  },
  ship(guildId) {
    return game.ship(guildId)
  },
  timeUntilNextTick() {
    const currentTickProgress = Date.now() - game.lastTick
    return constants.STEP_INTERVAL - currentTickProgress
  },
  getCrewMember({ memberId, guildId }) {
    const guild = game.guilds.find((g) => g.guildId === guildId) || {}
    if (!guild || !guild.ship) return
    const member = (guild.ship.members || []).find((m) => m.id === memberId)
    return member
  },
}
