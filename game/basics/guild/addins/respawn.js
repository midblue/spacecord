const story = require('../../story/story')
const { liveify } = require('../guild')
const createDefault = require('../createDefaultGuild')

module.exports = (guild) => {
  guild.ship.respawn = (msg) => {
    const members = [...guild.ship.members]
    const seen = guild.ship.seen
    const captain = guild.ship.captain
    const oldShip = guild.ship
    const g = createDefault({ discordGuild: {} })
    liveify(g, guild.context)
    const newShip = g.ship
    guild.pushToGuild(story.ship.respawn(oldShip, newShip), msg)
    guild.ship = newShip
    g.ship.members = members
    g.ship.seen = seen
    g.ship.captain = captain
    guild.saveNewDataToDb()
  }
}
