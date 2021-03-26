const story = require(`../../game/basics/story/story`)
const { log } = require(`../botcommon`)

module.exports = {
  tag: `eBrake`,
  captain: true,
  pm: true,
  documentation: {
    name: `ebrake`,
    value: `Immediately halts the ship.`,
    emoji: `🚷`,
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

    // ---------- use power
    const powerRes = guild.ship.usePower(`eBrake`)
    if (!powerRes.ok) {
      authorCrewMemberObject.message(powerRes.message)
      return
    }

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log(`no user found in eBrake`)
    const staminaRes = member.useStamina(`eBrake`)
    if (!staminaRes.ok) return

    guild.ship.hardStop()
    guild.message(story.move.eBrake(msg.author.id))
    return true
  },
}
