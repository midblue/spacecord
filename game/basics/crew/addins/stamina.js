const story = require(`../../story/story`)
const staminaRequirements = require(`../staminaRequirements`)

module.exports = (member) => {
  member.maxStamina = () => {
    return 5 + member.totalLevel() * 0.1
  }

  member.staminaGainPerTick = () => {
    return Math.max(2, member.maxStamina() * 0.2)
  }

  member.gainStamina = (presetAmount) => {
    const gainAmount = presetAmount || member.staminaGainPerTick()
    const gainAmountAsPercent = gainAmount / member.maxStamina()
    member.stamina = (member.stamina || 0) + gainAmountAsPercent
    if (member.stamina > 1) member.stamina = 1
  }

  member.useStamina = (amount) => {
    if (typeof amount === `string`) amount = staminaRequirements[amount]

    const currentMemberStamina = member.stamina * member.maxStamina()
    if (amount > currentMemberStamina) {
      return {
        ok: false,
        message: story.crew.stamina.notEnough(
          member.id,
          currentMemberStamina,
          amount,
          member.guild.context.timeUntilNextTick(),
        ),
      }
    }
    member.stamina = (member.stamina || 1) - amount / member.maxStamina()
    if (member.stamina < 0.001) member.stamina = 0

    return {
      ok: true,
    }
  }
}
