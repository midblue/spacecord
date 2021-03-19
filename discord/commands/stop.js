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
  async action({ settings, msg, match, guild, authorCrewMemberObject }) {
    log(msg, `Stop`, match)

    // ---------- use stamina
    if (!authorCrewMemberObject) return console.log(`no user found in thrust`)
    const staminaRes = authorCrewMemberObject.useStamina(`thrust`)
    if (!staminaRes.ok) return

    const ang = angle(0, 0, ...guild.ship.velocity)
    let power = 1

    const thrustAmplification = 1 // todo use piloting etc to determine
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
