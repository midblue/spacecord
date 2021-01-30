module.exports = (guild) => {
  guild.ship.getAvailableSpeedLevels = () => {
    const availableSpeedLevels = []

    const bestShipSpeedLevels = guild.ship.equipment.engine.reduce(
      (max, engine) => Math.max(max, engine.powerLevels || 0),
      2,
    )

    availableSpeedLevels.push({ emoji: '🔟', speed: 1 })
    if (bestShipSpeedLevels > 1)
      availableSpeedLevels.push({ emoji: '0️⃣', speed: 0 })
    if (bestShipSpeedLevels > 2)
      availableSpeedLevels.push({ emoji: '5️⃣', speed: 0.5 })
    if (bestShipSpeedLevels > 3)
      availableSpeedLevels.push({ emoji: '7️⃣', speed: 0.7 })
    if (bestShipSpeedLevels > 4)
      availableSpeedLevels.push({ emoji: '2️⃣', speed: 0.2 })
    if (bestShipSpeedLevels > 5)
      availableSpeedLevels.push({ emoji: '1️⃣', speed: 0.1 })
    if (bestShipSpeedLevels > 6)
      availableSpeedLevels.push({ emoji: '9️⃣', speed: 0.9 })
    if (bestShipSpeedLevels > 7)
      availableSpeedLevels.push({ emoji: '4️⃣', speed: 0.4 })
    if (bestShipSpeedLevels > 8)
      availableSpeedLevels.push({ emoji: '8️⃣', speed: 0.8 })
    if (bestShipSpeedLevels > 9)
      availableSpeedLevels.push({ emoji: '3️⃣', speed: 0.3 })
    if (bestShipSpeedLevels > 10)
      availableSpeedLevels.push({ emoji: '6️⃣', speed: 0.6 })

    return availableSpeedLevels
  }
}
