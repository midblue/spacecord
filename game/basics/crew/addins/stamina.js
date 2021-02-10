const story = require('../../story/story')
const staminaRequirements = require('../staminaRequirements')

module.exports = (member) => {
  member.maxStamina = () => {
    return 12
  }

  member.staminaGainPerTick = () => {
    return 3
  }

  member.gainStamina = (presetAmount) => {
    const gainAmount = Math.round(presetAmount || member.staminaGainPerTick()),
      gainAmountAsPercent = gainAmount / member.maxStamina()
    member.stamina = (member.stamina || 0) + gainAmountAsPercent
    if (member.stamina > 1) member.stamina = 1
  }

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
    member.stamina = (member.stamina || 1) - amount / member.maxStamina()
    if (member.stamina < 0.001) member.stamina = 0

    return {
      ok: true,
    }
  }
}
