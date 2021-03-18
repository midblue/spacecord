const send = require(`../actions/send`)
const { log, canEdit } = require(`../botcommon`)
const { usageTag, captainTag } = require(`../../common`)
const awaitReaction = require(`../actions/awaitReaction`)
const Discord = require(`discord.js-light`)
const runGuildCommand = require(`../actions/runGuildCommand`)
const depart = require(`../actions/depart`)

module.exports = {
  tag: `flightDeck`,
  pm: true,
  documentation: false,
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:flightdeck|flight)$`, `gi`).exec(
      content,
    )
  },
  async action({ msg, guild }) {
    log(msg, `Flight Deck`, msg.guild?.name)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`🕹 Flight Deck`)

    embed.description = `A cadre of pilots sits clustered around the ship's controls. The view from the windows beyond shows a full panorama of the ship's surroundings.`

    const reactions = []
    if (guild.ship.status.docked) {
      reactions.push({
        emoji: `🛫`,
        label: `Start Depart Vote ` + usageTag(0, `poll`),
        action: ({ msg, guild }) => {
          depart({ msg, guild })
        },
      })
    } else {
      const interactablePlanets = guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range: guild.ship.interactRadius(),
        excludeIds: guild.guildId,
      }).planets

      if (interactablePlanets.length) {
        reactions.push({
          emoji: `🪐`,
          label: `Land on a Nearby Planet`,
          action: ({ msg, guild }) => {
            runGuildCommand({
              msg,
              commandTag: `nearby`,
              props: { filter: `planets` },
            })
          },
        })
      }
    }

    reactions.push(
      ...[
        {
          emoji: `🔥`,
          label: `Fire Thrusters ` + usageTag(0, `thrust`),
          action: ({ msg, guild }) => {
            runGuildCommand({ msg, commandTag: `thrust` })
          },
        },
        {
          emoji: `📈`,
          label: `View Ship Path`,
          action: ({ msg, guild }) => {
            runGuildCommand({ msg, commandTag: `path` })
          },
        },
        {
          emoji: `🛑`,
          label: `Emergency Brake ` + captainTag + ` ` + usageTag(0, `eBrake`),
          action: ({ msg, guild, user }) => {
            runGuildCommand({ msg, commandTag: `eBrake` })
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
      commandsLabel: `Flight Commands`,
      respondeeFilter: (user) => user.id === msg.author.id,
    })
    if (await canEdit(sentMessage)) sentMessage.delete().catch(console.log)
  },
}
