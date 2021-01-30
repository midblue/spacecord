module.exports = (guild) => {
  guild.ship.getAvailableDirections = () => {
    const availableDirections = []

    const bestShipDirections = guild.ship.equipment.engine.reduce(
      (max, engine) => Math.max(max, engine.directions || 0),
      4,
    )

    availableDirections.push({ emoji: '➡️', vector: [1.414, 0] })
    if (bestShipDirections > 4)
      availableDirections.push({ emoji: '↗️', vector: [1, 1] })
    availableDirections.push({ emoji: '⬆️', vector: [0, 1.414] })
    if (bestShipDirections > 5)
      availableDirections.push({ emoji: '↖️', vector: [-1, 1] })
    availableDirections.push({ emoji: '⬅️', vector: [-1.414, 0] })
    if (bestShipDirections > 6)
      availableDirections.push({ emoji: '↙️', vector: [-1, -1] })
    availableDirections.push({ emoji: '⬇️', vector: [0, -1.414] })
    if (bestShipDirections > 7)
      availableDirections.push({ emoji: '↘️', vector: [1, -1] })

    return availableDirections
  }
}
