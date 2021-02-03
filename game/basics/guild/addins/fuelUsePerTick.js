module.exports = (guild) => {
  guild.ship.fuelUsePerTick = () => {
    return (guild.ship.equipment.engine || []).reduce((total, engine) => {
      return total + (engine.fuelUse || 0) * (guild.ship.speed || 0)
    }, 0)
  }
}
