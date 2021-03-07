module.exports = (guild) => {
  guild.ship.maxPower = () => {
    return guild.ship.equipment
      .find((e) => e.equipmentType === `battery`)
      .list.reduce((total, battery) => total + battery.capacity, 0)
  }
}
