const send = require('../actions/send')
const { log } = require('../botcommon')
const mechanicsMinigame = require('../minigames/mechanicsMinigame')

module.exports = {
  tag: 'trainMechanics',
  documentation: false,
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainmechanics?|mechanics?training)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, guild, authorCrewMemberObject, staminaRequired }) {
    log(msg, 'Train Mechanics', msg.guild.name)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log('no user found in trainMech')
    if (!staminaRequired)
      staminaRequired = authorCrewMemberObject.staminaRequiredFor('mechanics')
    const staminaRes = member.useStamina('train')
    if (!staminaRes.ok) return send(msg, staminaRes.message)

    mechanicsMinigame({ msg, user: authorCrewMemberObject, guild })
  },
}
