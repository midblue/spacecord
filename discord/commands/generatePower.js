const send = require('../actions/send')
const awaitReaction = require('../actions/awaitReaction')
const { log } = require('../botcommon')
const Discord = require('discord.js')

module.exports = {
  tag: 'generatePower',
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:generatepower)$`, 'gi').exec(
      content,
    )
  },
  async action({ msg, settings, client, type, ship }) {
    log(msg, 'Generate Power', msg.guild.name)

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(type || 'Treadmill')
      .addFields({
        name: 'Work out to generate power!',
        value:
          'React to this message with running emoji as many times as you can within 10 seconds!',
      })

    const sentMessages = await send(msg, embed)
    const lastMessage = sentMessages[sentMessages.length - 1]
    const collected = await awaitReaction({
      msg: lastMessage,
      embed,
      time: 10000,
      listeningType: 'running emoji',
    })
    const totalReactions = collected
      .filter((e) =>
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
        ].includes(e.emoji.name),
      )
      .reduce((total, c) => total + c.count, 0)
    const powerRes = ship.addPower(totalReactions)
    if (powerRes.ok) {
      embed.fields = {
        name: `Time's Up!`,
        value: powerRes.message,
      }
      lastMessage.edit(embed)
    } else send(msg, powerRes.message)
  },
}
