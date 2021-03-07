const story = require(`../../story/story`)
const {
  bearingToRadians,
  bearingToDegrees,
  bearingToArrow,
  distance,
} = require(`../../../../common`)

module.exports = (guild) => {
  guild.ship.isOverburdened = () => {
    return guild.ship.getTotalWeight() / guild.ship.maxWeight() >= 1
  }

  guild.ship.getTotalWeight = () => {
    const equipmentWeight = guild.ship.equipment.reduce((t, { list }) => {
      const typeWeight = list.reduce((total, eq) => total + (eq.weight || 0), 0)
      return t + typeWeight
    }, 0)
    const cargoWeight = guild.ship.cargo.reduce(
      (total, c) => total + Math.abs(c.amount || 0),
      0,
    )
    const totalWeight = (guild.ship.weight || 0) + equipmentWeight + cargoWeight

    return totalWeight
  }

  guild.ship.maxWeight = () => {
    return guild.ship.equipment.find((e) => e.equipmentType === `chassis`)
      .list[0].maxWeight
  }
}
