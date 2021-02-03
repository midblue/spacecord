const send = require('../actions/send')
const awaitReaction = require('../actions/awaitReaction')
const { log } = require('../botcommon')
const Discord = require('discord.js')

module.exports = {
  tag: 'ship',
  documentation: {
    value: `High-level overview of the ship's status and ship-related actions.`,
    emoji: '🚀',
    priority: 80,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:s|ship|status)$`, 'gi').exec(
      content,
    )
  },
  async action({ msg, guild, ship }) {
    log(msg, 'Ship', msg.guild.name)

    const status = await ship.statusReport()
    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`${ship.name} | Status Report`)
      .setDescription(status.headline)
      .addFields(status.fields.map((s) => ({ ...s, inline: true })))

    const lastMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: lastMessage,
      reactions: status.actions,
      embed,
      guild,
    })
  },
}
