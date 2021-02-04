const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js')
const awaitReaction = require('../actions/awaitReaction')

module.exports = {
  tag: 'shipInfo',
  documentation: {
    name: `shipinfo`,
    value: `Ship equipment, age, health, etc.`,
    emoji: '📊',
    priority: 80,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:shipinfo|si)$`, 'gi').exec(content)
  },
  async action({ msg, settings, ship, guild }) {
    log(msg, 'Ship Info', msg.guild.name)
    // age, model, upgrades, slots, image, etc

    const status = ship.shipInfo()
    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`${ship.name} | Ship Info`)
      .addFields(status.fields.map((s) => ({ ...s, inline: s.inline ?? true })))

    const lastMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: lastMessage,
      reactions: status.actions,
      embed,
      guild,
    })
  },
}
