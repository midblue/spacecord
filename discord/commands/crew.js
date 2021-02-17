const { usageTag } = require('../../common')
const send = require('../actions/send')
const { log, username } = require('../botcommon')
const Discord = require('discord.js-light')
const runGuildCommand = require('../actions/runGuildCommand')
const awaitReaction = require('../actions/awaitReaction')

module.exports = {
  tag: 'crewQuarters',
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:crew|crews?quarters?)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, guild }) {
    log(msg, 'Crew', msg.guild.name)
    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`👨‍👩‍👧‍👧 Crew Quarters`)

    embed.fields = [
      {
        name: `👩‍👩‍👧‍👦 Crew`,
        value: guild.ship.members.length + ' members',
        inline: true,
      },
    ]

    const reactions = [
      {
        emoji: '🏃‍♀️',
        label: 'Generate Power ' + usageTag(null, 'generatePower'),
        async action({ msg }) {
          runGuildCommand({
            commandTag: 'generatePower',
            msg,
          })
        },
      },
      {
        emoji: '🏆',
        label: 'Crew Rankings',
        async action({ msg }) {
          runGuildCommand({
            msg,
            commandTag: 'rankings',
          })
        },
      },
      {
        emoji: '🏋️‍♂️',
        label: 'Train your skills',
        action: async ({ msg }) => {
          runGuildCommand({ msg, commandTag: 'train' })
        },
      },
    ]

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions,
      embed,
      guild,
      respondeeFilter: (user) => user.id === msg.author.id,
    })
    sentMessage.delete()
  },
}
