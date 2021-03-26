const story = require(`../../story/story`)
const staminaRequirements = require(`../staminaRequirements`)

module.exports = (member) => {
  member.maxStamina = () => {
    return 5 + member.totalLevel() * 0.1
  }

  member.staminaGainPerTick = () => {
    return (
      Math.max(2 / TICKS_PER_HOUR, member.maxStamina() * 0.2) / TICKS_PER_HOUR
    )
  }

  member.gainStamina = (presetAmount) => {
    const gainAmount = presetAmount || member.staminaGainPerTick()
    const gainAmountAsPercent = gainAmount / member.maxStamina()
    member.stamina = (member.stamina || 0) + gainAmountAsPercent
    if (!presetAmount && member.stamina > 1) member.stamina = 1
  }

  member.useStamina = (amount) => {
    if (typeof amount === `string`) amount = staminaRequirements[amount]

    const currentMemberStamina = member.stamina * member.maxStamina()
    if (amount > currentMemberStamina) {
      const message = story.crew.stamina.notEnough(
        member.id,
        currentMemberStamina,
        amount,
      )
      member.message(message)
      return {
        ok: false,
        message,
      }
    }

    member.stamina = (member.stamina || 1) - amount / member.maxStamina()
    if (member.stamina < 0.001) member.stamina = 0

    member.addXp(`legacy`, amount, true) // because they did something

    return {
      ok: true,
    }
  }
}
