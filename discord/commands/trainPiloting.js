const send = require('../actions/send')
const { log } = require('../botcommon')
const pilotingMinigame = require('../minigames/pilotingMinigame')

module.exports = {
  tag: 'trainPiloting',
  documentation: false,
  test (content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainpiloti?n?g?|piloti?n?g?training)$`,
      'gi'
    ).exec(content)
  },
  async action ({ msg, guild, authorCrewMemberObject, staminaRequired }) {
    log(msg, 'Train Piloting', msg.guild.name)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log('no user found in trainPiloting')
    if (!staminaRequired) { staminaRequired = authorCrewMemberObject.staminaRequiredFor('piloting') }
    const staminaRes = member.useStamina('train')
    if (!staminaRes.ok) return send(msg, staminaRes.message)

    pilotingMinigame({ msg, user: authorCrewMemberObject, guild })
  }
}
