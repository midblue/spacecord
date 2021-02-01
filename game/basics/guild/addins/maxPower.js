module.exports = (guild) => {
  guild.ship.maxPower = () => {
    return guild.ship.equipment.battery.reduce(
      (total, battery) => battery.capacity + total,
      0,
    )
  }
}
