const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const nearby = require(`./nearby`)
const awaitReaction = require(`../actions/awaitReaction`)

module.exports = {
  tag: `planet`,
  documentation: {
    name: `planet`,
    value: `Planetside actions the ship can take.`,
    emoji: `🪐`,
    category: `planet`,
    priority: 30
  },
  test (content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:p|planet|cantina|outside|walkaround|walk|here|viewplanet|seeplanet|lookatplanet)$`,
      `gi`
    ).exec(content)
  },
  async action ({ msg, settings, client, guild }) {
    log(msg, `Planet`, msg.guild.name)

    if (!guild.ship.status.docked) { return nearby.action({ msg, guild, filter: `planets` }) }
    const dockedPlanet = guild.context.planets.find(
      (p) => p.name === guild.ship.status.docked
    )
    if (!dockedPlanet) {
      guild.ship.status.docked = false
      return send(
        msg,
        `Wait, what? The ship your planet is supposed to be docked at wasn't found. You're back in space now, floating along.`
      )
    }

    const fields = guild.ship.getPlanetFields(dockedPlanet)
    const availableActions = guild.ship.getPlanetActions(dockedPlanet)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`🪐 ` + dockedPlanet.name)
      .addFields(fields.map((f) => ({ inline: true, ...f })))

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions: availableActions,
      actionProps: { planet: dockedPlanet },
      embed,
      guild
    })
  }
}
