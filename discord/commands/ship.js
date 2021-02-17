const send = require(`../actions/send`)
const awaitReaction = require(`../actions/awaitReaction`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)

module.exports = {
  tag: `ship`,
  documentation: {
    value: `High-level overview of the ship's status and ship-related actions.`,
    emoji: `🚀`,
    category: `ship`,
    priority: 80
  },
  test (content, settings) {
    return new RegExp(`^${settings.prefix}(?:s|ship|status)$`, `gi`).exec(
      content
    )
  },
  async action ({ msg, guild }) {
    log(msg, `Ship`, msg.guild.name)

    const status = await guild.ship.statusReport()
    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`🚀 ${guild.ship.name} | Status Report`)
      .setDescription(status.headline)
      .addFields(status.fields.map((s) => ({ ...s, inline: true })))

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions: status.actions,
      embed,
      guild
    })
  }
}
