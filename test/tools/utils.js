const { msg } = require(`./messages`)
const game = require(`../../game/manager`)
const spawnAction = require(`../../discord/commands/spawn`).action
const bot = require(`../../discord/bot`)

module.exports = {
  async addShip(props = {}) {
    await spawnAction({
      msg,
      authorIsAdmin: true,
      client: bot.client,
    })
    const spawnedGuild = (await game.guild(msg.guild.id)).guild
    for (let prop in props) spawnedGuild.ship[prop] = props[prop]
    return spawnedGuild.ship
  },
}
