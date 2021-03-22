const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const awaitReaction = require(`../actions/awaitReaction`)
const runGuildCommand = require(`../actions/runGuildCommand`)

module.exports = {
  tag: `planet`,
  pmOnly: true,
  documentation: {
    name: `planet`,
    value: `Planetside actions the ship can take.`,
    emoji: `🪐`,
    category: `planet`,
    priority: 30,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:p|planet|cantina|outside|walkaround|walk|here|viewplanet|seeplanet|lookatplanet)$`,
      `gi`,
    ).exec(content)
  },
  async action({ msg, settings, client, guild, authorCrewMemberObject }) {
    log(msg, `Planet`, msg.guild?.name)

    if (!guild.ship.status.docked)
      return runGuildCommand({
        msg,
        commandTag: `nearby`,
        props: { filter: `planets` },
      })

    const dockedPlanet = guild.context.planets.find(
      (p) => p.name === guild.ship.status.docked,
    )
    if (!dockedPlanet) {
      guild.ship.status.docked = ``
      return authorCrewMemberObject.message(
        `Wait, what? The ship your planet is supposed to be docked at wasn't found.`,
      )
    }

    const fields = guild.ship.getPlanetFields(dockedPlanet)
    const availableActions = guild.ship.getPlanetActions(dockedPlanet)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`🪐 ` + dockedPlanet.name)
      .addFields(fields.map((f) => ({ inline: true, ...f })))

    if (authorCrewMemberObject)
      authorCrewMemberObject.message(embed, {
        reactions: availableActions,
        actionProps: { planet: dockedPlanet },
      })
    else
      guild.message(embed, null, {
        reactions: availableActions,
        actionProps: { planet: dockedPlanet },
      })
  },
}
