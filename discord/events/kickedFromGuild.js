const { log } = require('../botcommon')
const manager = require('../../game/manager')

module.exports = async (guild) => {
  console.log('k')
  log({ guild }, 'Kicked from guild', guild.name, guild.id)
  manager.deactivateGuild(guild.id)
}
