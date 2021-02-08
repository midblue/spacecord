const send = require('../actions/send')
const awaitReaction = require('../actions/awaitReaction')
const { log } = require('../botcommon')
const Discord = require('discord.js-light')

module.exports = {
  tag: 'broadcast',
  documentation: {
    value: `Send a broadcast to the area.`,
    emoji: '📣',
    category: 'interaction',
    priority: 60,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:broadcast|b)$`, 'gi').exec(content)
  },
  async action({ msg, guild, ship }) {
    log(msg, 'Broadcast', msg.guild.name)

    const broadcastRes = ship.broadcastOptions()
    if (!broadcastRes.ok) return send(msg, broadcastRes.message)
    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Broadcast`)
      .addFields(broadcastRes.fields.map((s) => ({ inline: true, ...s })))

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions: broadcastRes.actions,
      embed,
      guild,
    })
  },
}
