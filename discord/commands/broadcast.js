const send = require(`../actions/send`)
const awaitReaction = require(`../actions/awaitReaction`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)

module.exports = {
  tag: `broadcast`,
  pm: true,
  documentation: {
    value: `Send a broadcast to the area.`,
    emoji: `📣`,
    category: `interaction`,
    priority: 60,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:broadcast|b)$`, `gi`).exec(content)
  },
  async action({ msg, guild, authorCrewMemberObject, ship }) {
    log(msg, `Broadcast`, msg.guild?.name)

    const broadcastRes = ship.broadcastOptions()
    if (!broadcastRes.ok)
      return authorCrewMemberObject.message(broadcastRes.message)
    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`Broadcast`)
      .addFields(broadcastRes.fields.map((s) => ({ inline: true, ...s })))

    await authorCrewMemberObject.message(embed, {
      reactions: broadcastRes.actions,
      commandsLabel: `Start Broadcast Vote`,
    })
  },
}
