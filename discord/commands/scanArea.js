const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const awaitReaction = require(`../actions/awaitReaction`)
const runGuildCommand = require(`../actions/runGuildCommand`)
const { usageTag } = require(`../../common`)

module.exports = {
  tag: `scanArea`,
  pm: true,
  delete: true,
  documentation: {
    name: `scan`,
    value: `Scan the ship's surroundings.`,
    emoji: `📡`,
    category: `interaction`,
    priority: 85,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:scan|scanarea)$`, `gi`).exec(
      content,
    )
  },
  async action({ msg, settings, client, guild, ship }) {
    log(msg, `Scan Area`, msg.guild?.name)

    // ---------- use stamina
    const authorCrewMemberObject = guild.ship.members.find(
      (m) => m.id === msg.author.id,
    )
    if (!authorCrewMemberObject) return console.log(`no user found in scanArea`)
    const staminaRes = authorCrewMemberObject.useStamina(`scan`)
    if (!staminaRes.ok) return

    const scanRes = await ship.scanArea()
    if (!scanRes.ok)
      return setTimeout(() => guild.message(scanRes.message), 1000) // waiting for out of power message to go first

    if (scanRes.image) {
      await guild.message(
        new Discord.MessageAttachment(scanRes.map, `scan.png`),
      )
      if (msg.pm)
        authorCrewMemberObject.message(
          new Discord.MessageAttachment(scanRes.map, `scan.png`),
        )
    }
    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      // .setTitle(scanRes.message)
      .setDescription(
        `\`\`\`Telemetry Unit: ` +
          scanRes.model +
          (scanRes.image ? `` : `\n` + scanRes.map) +
          (scanRes.repairMessage ? `\n` + scanRes.repairMessage : ``) +
          `\`\`\``,
      )
    if (scanRes.key && scanRes.key.length) {
      embed.addFields({
        name: `Key`,
        value: scanRes.key.map((k) => `\`` + k + `\``).join(`, `),
      })
    }
    embed.addFields(...scanRes.data.map((d) => ({ ...d, inline: true })), {
      name: `Scanned By`,
      value: msg.author.username,
    })

    const reactions = scanRes.actions || []
    if (scanRes.lowPower) {
      reactions.push({
        emoji: `🔌`,
        label: `Generate Power ` + usageTag(0, `generatePower`),
        action() {
          runGuildCommand({ msg, commandTag: `generatePower` })
        },
      })
    }
    if (scanRes.repair <= 0.8) {
      reactions.push({
        emoji: `🔧`,
        label:
          `Repair ` +
          usageTag(0, guild.ship.repairStaminaCost(scanRes.equipment)),
        action() {
          runGuildCommand({ msg, commandTag: `repair` })
        },
      })
    }
    reactions.push({
      emoji: `📡`,
      label: `Scan Again ` + usageTag(scanRes.equipment.powerUse, `scan`),
      action() {
        runGuildCommand({ msg, commandTag: `scanArea` })
      },
    })

    await guild.message(embed, null, reactions)
    if (msg.pm) authorCrewMemberObject.message(embed, reactions)

    if (scanRes.message) {
      guild.message(scanRes.message)
      if (msg.pm) authorCrewMemberObject.message(scanRes.message)
    }
  },
}
