const send = require('../actions/send')
const { log } = require('../botcommon')
const { numberToEmoji, capitalize } = require('../../common')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js-light')

module.exports = {
  tag: 'scanShip',
  documentation: false,
  async action({ msg, guild, otherShip }) {
    log(msg, 'Scan Ship', msg.guild.name)
    if (!otherShip) return

    const res = guild.ship.scanOtherShip(otherShip)
    if (!res.ok) return send(msg, res.message)

    const actions = guild.ship.getActionsOnOtherShip(otherShip)

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle('Nearby Ship Details')
      .addFields(res.fields.map((f) => ({ inline: true, ...f })))

    const sentMessage = (await send(msg, embed))[0]
    if (res.message) send(msg, res.message)
    await awaitReaction({
      msg: sentMessage,
      reactions: actions,
      embed,
      guild,
    })
  },
}