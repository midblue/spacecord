const send = require(`../actions/send`)
const { log, canEdit } = require(`../botcommon`)
const { usageTag } = require(`../../common`)
const awaitReaction = require(`../actions/awaitReaction`)
const Discord = require(`discord.js-light`)
const runGuildCommand = require(`../actions/runGuildCommand`)
const depart = require(`../actions/depart`)

module.exports = {
  tag: `holoDeck`,
  pm: true,
  documentation: false,
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:holodeck|holo)$`, `gi`).exec(
      content,
    )
  },
  async action({ msg, guild }) {
    log(msg, `Holo Deck`, msg.guild?.name)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`🕹 Holo Deck`)

    embed.description = `The dazzling array of the map projection in the center of the room provides a centerpiece around which the crew's cartogaphers and technicians operate the ship's various sensors and beacons.`

    const reactions = []
    const scannableShips =
      !guild.ship.status.docked &&
      guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range: guild.ship.shipScanRadius(),
        excludeIds: guild.id,
      }).guilds
    if (scannableShips) {
      reactions.push({
        emoji: `🔭`,
        label: `Scan a Nearby Ship`,
        action: ({ msg, guild }) => {
          runGuildCommand({
            msg,
            commandTag: `nearby`,
            props: { filter: `guilds` },
          })
        },
      })
    }

    reactions.push(
      ...[
        {
          emoji: `📡`,
          label:
            `Scan Area ` +
            usageTag(
              guild.ship.equipment.find((e) => e.equipmentType === `telemetry`)
                .list[0].powerUse,
              `scan`,
            ),
          requirements: guild.ship.equipment.find(
            (e) => e.equipmentType === `telemetry`,
          ).list[0].requirements,
          async action({ msg }) {
            await runGuildCommand({
              msg,
              commandTag: `scanArea`,
            })
          },
        },
        {
          emoji: `📣`,
          label: `Broadcast`,
          async action({ msg }) {
            await runGuildCommand({
              commandTag: `broadcast`,
              msg,
            })
          },
        },
        {
          emoji: `🗺`,
          label: `Map`,
          async action({ msg }) {
            await runGuildCommand({
              commandTag: `map`,
              msg,
            })
          },
        },
      ],
    )

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions,
      embed,
      guild,
      commandsLabel: `Holo Commands`,
      respondeeFilter: (user) => user.id === msg.author.id,
    })
    if (await canEdit(sentMessage)) sentMessage.delete().catch(console.log)
  },
}
