const constants = require('./basics/constants')
const crewMember = require('./basics/crewMember')
const guild = require('./basics/guild')
const story = require('./basics/story')
const { log } = require('./common')

/* 
---------------- Game Core ----------------
This object is our "instance" of the game that will handle updates,
the core loop, etc.

*/

const game = {
  // ---------------- Game Properties ----------------
  guilds: [],

  // ---------------- Game Loop Functions ----------------

  async start() {
    log('Core', 'STARTING GAME')

    // setInterval(async () => {
    //   console.log('')
    //   log('', '============= NEW GAME STEP =============')
    //   await this.beforeUpdate()
    //   await this.update()
    //   await this.afterUpdate()
    // }, constants.STEP_INTERVAL)
  },
  async beforeUpdate() {
    log('beforeUpdate')
  },
  async update() {
    log('update')
  },
  async afterUpdate() {
    log('afterUpdate')
  },

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
    this.guilds.push(newGuild)
    log('addGuild', 'Added guild to game', newGuild.guildName)
    return { ok: true, message: story.ship.get.first(newGuild) }
  },

  addCrewMember(newMember, guildId) {
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
    if (thisGuild.members.find((m) => m.id === newMember.id)) {
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
    thisGuild.members.push(newMember)
    log(
      'addGuild',
      'Added new member to guild',
      newMember.id,
      thisGuild.guildName,
    )
    // todo different message for the first user
    return { ok: true, message: story.crew.add.success(newMember, thisGuild) }
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
  spawn(discordGuild) {
    const newGuild = guild.spawn(discordGuild)
    const res = game.addGuild(newGuild)
    return res
  },
  addCrewMember({ discordUser, guildId }) {
    const member = crewMember.spawn(discordUser)
    const res = game.addCrewMember(member, guildId)
    return res
  },
}
