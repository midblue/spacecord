const send = require(`../actions/send`)
const { log } = require(`../botcommon`)

module.exports = {
  tag: `trainPiloting`,
  pm: true,
  documentation: false,
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainpiloti?n?g?|piloti?n?g?training)$`,
      `gi`,
    ).exec(content)
  },
  async action({ msg, guild, authorCrewMemberObject, staminaRequired }) {
    log(msg, `Train Piloting`, msg.guild?.name)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log(`no user found in trainPiloting`)
    if (!staminaRequired) {
      staminaRequired = authorCrewMemberObject.staminaRequiredFor(`piloting`)
    }
    const staminaRes = member.useStamina(staminaRequired)
    if (!staminaRes.ok) return

    // pilotingMinigame({ msg, user: authorCrewMemberObject, guild })
  },
}
