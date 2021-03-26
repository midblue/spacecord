const { log, canEdit } = require(`../botcommon`)
const { angle } = require(`../../common`)

module.exports = {
  tag: `stop`,
  equipmentType: `engine`,
  pmOnly: true,
  documentation: {
    value: `Adds thrust opposite to the ship's velocity.`,
    emoji: `🛑`,
    category: `ship`,
    priority: 74,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:stop)$`, `gi`).exec(content)
  },
  async action({ msg, match, guild, authorCrewMemberObject }) {
    log(msg, `Stop`, match)

    // ---------- use stamina
    if (!authorCrewMemberObject) return console.log(`no user found in thrust`)
    const staminaRes = authorCrewMemberObject.useStamina(`thrust`)
    if (!staminaRes.ok) return

    const ang = angle(0, 0, ...guild.ship.velocity)
    let power = 1

    const crewMemberPilotingSkill = authorCrewMemberObject.skillLevelDetails(
      `piloting`,
    ).level
    const engineRequirements =
      guild.ship.getRequirements(`engine`).requirements.piloting || 1
    const thrustAmplification = Math.max(
      0.1,
      Math.min(3, crewMemberPilotingSkill / engineRequirements),
    )
    power *= thrustAmplification

    const res = await guild.ship.thrust({
      power,
      angle: ang,
      thruster: authorCrewMemberObject,
    })
    if (!res.ok) authorCrewMemberObject.message(res.message)
    else guild.message(res.message, msg)
  },
}
