const send = require('../actions/send')
const { log, applyCustomParams } = require('../botcommon')
const Discord = require('discord.js-light')
const awaitReaction = require('../actions/awaitReaction')

module.exports = {
  tag: 'shipInfo',
  documentation: {
    name: `shipinfo`,
    value: `Ship equipment, age, health, etc.`,
    emoji: '📊',
    category: 'ship',
    priority: 80,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:shipinfo|si)$`, 'gi').exec(content)
  },
  async action({ msg, settings, ship, guild }) {
    log(msg, 'Ship Info', msg.guild.name)
    // age, model, upgrades, slots, image, etc

    const status = ship.shipInfo()
    status.fields = await applyCustomParams(msg, status.fields)
    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`${ship.name} | Ship Info`)
      .addFields(status.fields.map((s) => ({ inline: true, ...s })))

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions: status.actions,
      embed,
      guild,
    })
  },
}
