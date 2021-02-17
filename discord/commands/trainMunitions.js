const send = require('../actions/send')
const { log } = require('../botcommon')
const munitionsMinigame = require('../minigames/munitionsMinigame')

module.exports = {
  tag: 'trainMunitions',
  documentation: false,
  test (content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainmunitions?|munitions?training)$`,
      'gi'
    ).exec(content)
  },
  async action ({ msg, guild, authorCrewMemberObject, staminaRequired }) {
    log(msg, 'Train Munitions', msg.guild.name)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log('no user found in trainMunitions')
    if (!staminaRequired) { staminaRequired = authorCrewMemberObject.staminaRequiredFor('munitions') }
    const staminaRes = member.useStamina('train')
    if (!staminaRes.ok) return send(msg, staminaRes.message)

    munitionsMinigame({ msg, user: authorCrewMemberObject, guild })
  }
}
