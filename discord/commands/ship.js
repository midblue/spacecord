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
    return new RegExp(`^${settings.prefix}(?:ship)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game, client, ship }) {
    log(msg, 'Ship', msg.guild.name)

    const status = ship.statusReport()
    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`${ship.name} | Status Report`)
      .setDescription(status.headline)
      .addFields(status.fields.map((s) => ({ ...s, inline: true })))

    const sentMessages = await send(msg, embed)
    const lastMessage = sentMessages[sentMessages.length - 1]
    await awaitReaction({
      msg: lastMessage,
      reactions: ship.getAvailableActions(),
      embed,
    })
  },
}
