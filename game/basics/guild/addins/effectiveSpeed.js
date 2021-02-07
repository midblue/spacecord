module.exports = (guild) => {
  guild.ship.effectiveSpeed = () => {
    const rawMaxSpeed = guild.ship.equipment.engine.reduce(
      (total, engine) => engine.maxSpeed + total,
      0,
    )

    let percentOfMaxShipWeight =
      guild.ship.getTotalWeight() / guild.ship.maxWeight
    if (percentOfMaxShipWeight > 1) percentOfMaxShipWeight = 1

    return (guild.ship.speed || 0) * rawMaxSpeed * (1 - percentOfMaxShipWeight)
  }
}
