module.exports = (member) => {
  member.gainStamina = (presetAmount) => {
    const gainAmount = Math.round(presetAmount || member.staminaGainPerTick()),
      gainAmountAsPercent = gainAmount / member.maxStamina()
    member.stamina = (member.stamina || 0) + gainAmountAsPercent
    if (member.stamina > 1) member.stamina = 1
  }
}
