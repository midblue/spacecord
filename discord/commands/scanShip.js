const send = require('../actions/send')
const { log } = require('../botcommon')
const { numberToEmoji, capitalize } = require('../../common')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js')
const story = require('../../game/basics/story/story')
const trainingActions = {
  engineering: require('./trainEngineering').action,
  mechanics: require('./trainMechanics').action,
}

module.exports = {
  tag: 'scanShip',
  documentation: false,
  async action({ msg, guild, authorCrewMemberObject, author, otherGuild }) {
    log(msg, 'Scan Ship', msg.guild.name)
    if (!otherGuild) return

    const res = guild.ship.scanOtherShip(otherGuild)
    if (!res.ok) return send(msg, res.message)

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle('Nearby Ship Details')
      .addFields(res.fields.map((f) => ({ inline: true, ...f })))

    const sentMessage = (await send(msg, embed))[0]
    if (res.message) send(msg, res.message)
    await awaitReaction({
      msg: sentMessage,
      reactions: res.actions,
      embed,
      guild,
    })
  },
}
