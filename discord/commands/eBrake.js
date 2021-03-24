const powerRequirements = require(`../../game/basics/guild/powerRequirements`)
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
    const powerRes = guild.ship.usePower(powerRequirements.eBrake)
    if (!powerRes.ok) return authorCrewMemberObject.message(powerRes.message)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log(`no user found in eBrake`)
    const staminaRequired = authorCrewMemberObject.staminaRequiredFor(`eBrake`)
    const staminaRes = member.useStamina(staminaRequired)
    if (!staminaRes.ok) return

    guild.ship.hardStop()
    return guild.message(story.move.eBrake(msg.author.id))
  },
}
