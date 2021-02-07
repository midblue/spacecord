module.exports = (guild) => {
  guild.ship.getTotalWeight = () => {
    const equipmentWeight = Object.keys(guild.ship.equipment).reduce(
      (t, eqType) => {
        const typeWeight = guild.ship.equipment[eqType].reduce(
          (total, eq) => total + (eq.weight || 0),
          0,
        )
        return t + typeWeight
      },
      0,
    )
    const cargoWeight = guild.ship.cargo.reduce(
      (total, c) => total + Math.abs(c.amount || 0),
      0,
    )
    const totalWeight = guild.ship.weight + equipmentWeight + cargoWeight

    return totalWeight
  }
}
