const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js')
const awaitReaction = require('../actions/awaitReaction')
const runGuildCommand = require('../actions/runGuildCommand')

module.exports = {
  tag: 'scanArea',
  documentation: {
    name: `scan`,
    value: `Scan the ship's surroundings.`,
    emoji: '📡',
    priority: 85,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:scan|scanarea)$`, 'gi').exec(
      content,
    )
  },
  async action({ msg, settings, client, guild, ship }) {
    log(msg, 'Scan Area', msg.guild.name)

    const scanRes = await ship.scanArea()
    if (!scanRes.ok) return setTimeout(() => send(msg, scanRes.message), 1000) // waiting for out of power message to go first

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      // .setTitle(scanRes.message)
      .setDescription(
        '```Telemetry Unit: ' + scanRes.model + '\n' + scanRes.map + '```',
      )
      .addFields(
        {
          name: 'Key',
          value: scanRes.key.map((k) => '`' + k + '`').join(', '),
        },
        ...scanRes.data.map((d) => ({ ...d, inline: true })),
      )
    const lastMessage = (await send(msg, embed))[0]

    if (scanRes.repair <= 0.6 || scanRes.lowPower) {
      const reactions = []
      reactions.push({
        emoji: '📡',
        action() {
          runGuildCommand({ msg, commandTag: 'scanArea' })
        },
      })
      if (scanRes.repair <= 0.6)
        reactions.push({
          emoji: '🔧',
          action() {
            runGuildCommand({ msg, commandTag: 'repair' })
          },
        })
      if (scanRes.lowPower)
        reactions.push({
          emoji: '🏃‍♀️',
          action() {
            runGuildCommand({ msg, commandTag: 'generatePower' })
          },
        })

      await awaitReaction({
        msg: lastMessage,
        reactions,
        embed,
        guild,
      })
    }
  },
}
