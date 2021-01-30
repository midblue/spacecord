module.exports = (guild) => {
  guild.ship.maxPower = () => {
    return guild.ship.equipment.battery.reduce(
      (total, battery) => total + battery.capacity,
      0,
    )
  }
}