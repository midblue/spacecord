const { msg, msg2 } = require(`./messages`)
const game = require(`../../game/manager`)
const spawnAction = require(`../../discord/commands/spawn`).action
const bot = require(`../../discord/bot`)

module.exports = {
  async addShip(props = {}, second) {
    const message = second ? msg2 : msg
    await spawnAction({
      msg: message,
      authorIsAdmin: true,
      client: bot.client,
    })
    const spawnedGuild = (await game.guild(message.guild.id)).guild
    for (let prop in props) spawnedGuild.ship[prop] = props[prop]

    return spawnedGuild.ship
  },
}
