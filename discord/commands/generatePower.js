const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js-light')
const awaitReaction = require('../actions/awaitReaction')
const runGuildCommand = require('../actions/runGuildCommand')

module.exports = {
  tag: 'generatePower',
  documentation: {
    name: `generatepower`,
    value: `Hop on the treadmill to make some power for the ship!`,
    emoji: '🏃',
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:generatepower)$`, 'gi').exec(
      content,
    )
  },
  async action({ msg, settings, exerciseType, ship, guild }) {
    log(msg, 'Generate Power', msg.guild.name)

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(exerciseType || 'Treadmill')
      .addFields({
        name: 'Work out to generate power!',
        value: `React to this message with running emoji (🏃‍♀️💨👟) as many times as you can within 10 seconds!
Other crew members can help out, too.`,
      })

    const sentMessage = (await send(msg, embed))[0]
    const collected = await awaitReaction({
      msg: sentMessage,
      embed,
      time: 10000,
      listeningType: 'running emoji',
    })
    const totalReactions = collected
      .filter(({ user, emoji }) =>
        [
          '🏃‍♀️',
          '🏃‍♂️',
          '🏃🏻‍♀️',
          '🏃🏼‍♀️',
          '🏃🏽‍♀️',
          '🏃🏾‍♀️',
          '🏃🏿‍♀️',
          '🏃🏻‍♂️',
          '🏃🏼‍♂️',
          '🏃🏽‍♂️',
          '🏃🏾‍♂️',
          '🏃',
          '🏃🏿‍♂️',
          '💨',
          '🎽',
          '👟',
          '🌬️',
        ].includes(emoji),
      )
      .reduce((total, c) => total + c.count, 0)

    const powerRes = ship.addPower(totalReactions)
    if (powerRes.ok) {
      sentMessage.edit(embed)
      embed.fields = {
        name: `Time's Up!`,
        value: powerRes.message,
      }
    } else send(msg, powerRes.message)

    setTimeout(async () => {
      const reactionOptions = [
        {
          emoji: '🏃‍♀️',
          action() {
            runGuildCommand({ msg, commandTag: 'generatePower' })
          },
        },
      ]
      await awaitReaction({
        msg: sentMessage,
        reactions: reactionOptions,
        embed,
        guild,
      })
    }, 500)
  },
}
