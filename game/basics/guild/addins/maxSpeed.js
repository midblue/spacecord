module.exports = (guild) => {
  guild.ship.maxSpeed = () => {
    return guild.ship.equipment.engine.reduce(
      (total, engine) => engine.maxSpeed + total,
      0,
    )
  }
}
