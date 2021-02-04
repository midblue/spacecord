const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js')
const awaitReaction = require('../actions/awaitReaction')

module.exports = {
  tag: 'rankings',
  documentation: {
    name: `rankings`,
    value: `Crew member rankinds`,
    emoji: '🏆',
    priority: 60,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:scores?|highscores?|rankings?)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, settings, ship, guild }) {
    log(msg, 'Rankings', msg.guild.name)

    // const status = ship.rankings()
    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Crew Rankings`)
    // .addFields(status.fields.map((s) => ({ ...s, inline: s.inline ?? true })))

    const lastMessage = (await send(msg, embed))[0]
    // await awaitReaction({
    //   msg: lastMessage,
    //   reactions: status.actions,
    //   embed,
    //   guild,
    // })
  },
}
