const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js-light')
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

    // ---------- use stamina
    const authorCrewMemberObject = guild.ship.members.find(
      (m) => m.id === msg.author.id,
    )
    if (!authorCrewMemberObject) return console.log('no user found in scanArea')
    const staminaRes = authorCrewMemberObject.useStamina('scan')
    if (!staminaRes.ok) return send(msg, staminaRes.message)

    const scanRes = await ship.scanArea()
    if (!scanRes.ok) return setTimeout(() => send(msg, scanRes.message), 1000) // waiting for out of power message to go first

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      // .setTitle(scanRes.message)
      .setDescription(
        '```Telemetry Unit: ' + scanRes.model + '\n' + scanRes.map + '```',
      )
    if (scanRes.key)
      embed.addFields({
        name: 'Key',
        value: scanRes.key.map((k) => '`' + k + '`').join(', '),
      })
    embed.addFields(...scanRes.data.map((d) => ({ ...d, inline: true })))
    const sentMessage = (await send(msg, embed))[0]

    if (scanRes.message) send(msg, scanRes.message)

    const reactions = scanRes.actions || []

    if (scanRes.lowPower)
      reactions.push({
        emoji: '🏃‍♀️',
        action() {
          runGuildCommand({ msg, commandTag: 'generatePower' })
        },
      })

    if (scanRes.repair <= 0.8)
      reactions.push({
        emoji: '🔧',
        action() {
          runGuildCommand({ msg, commandTag: 'repair' })
        },
      })

    reactions.push({
      emoji: '📡',
      action() {
        runGuildCommand({ msg, commandTag: 'scanArea' })
      },
    })

    await awaitReaction({
      msg: sentMessage,
      reactions,
      embed,
      guild,
    })
  },
}
