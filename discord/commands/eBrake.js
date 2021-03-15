const story = require(`../../game/basics/story/story`)
const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const message = require(`../actions/pushToGuild`) // todo do this all over the place

module.exports = {
  tag: `eBrake`,
  captain: true,
  documentation: {
    name: `ebrake`,
    value: `Immediately halts the ship.`,
    emoji: `🛑`,
    priority: 10,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:emergencybrake|ebrake)$`,
      `gi`,
    ).exec(content)
  },
  async action({ msg, guild, authorCrewMemberObject }) {
    log(msg, `Emergency Brake`, msg.channel.name)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log(`no user found in eBrake`)
    const staminaRequired = authorCrewMemberObject.staminaRequiredFor(`eBrake`)
    const staminaRes = member.useStamina(staminaRequired)
    if (!staminaRes.ok) return

    guild.ship.hardStop()
    return message({
      msg,
      id: guild.id,
      message: story.move.eBrake(msg.author.id),
    }) // todo do this all over the place
  },
}
