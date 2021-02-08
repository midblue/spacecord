const story = require('../../story/story')
const staminaRequirements = require('../staminaRequirements')

module.exports = (member) => {
  member.useStamina = (amount) => {
    if (typeof amount === 'string') amount = staminaRequirements[amount]

    const currentMemberStamina = member.stamina * member.maxStamina()
    if (amount > currentMemberStamina)
      return {
        ok: false,
        message: story.crew.stamina.notEnough(
          member.id,
          currentMemberStamina,
          amount,
        ),
      }
    member.stamina = amount / member.maxStamina()
    return {
      ok: true,
    }
  }
}
