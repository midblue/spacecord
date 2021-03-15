module.exports = (guild) => {
  guild.ship.isOverburdened = () => {
    return guild.ship.getTotalMass() / guild.ship.maxMass() >= 1
  }

  guild.ship.getTotalMass = () => {
    if (guild.ship.debugMass) return guild.ship.debugMass
    const equipmentMass = guild.ship.equipment.reduce((t, { list }) => {
      const typeMass = list.reduce((total, eq) => total + (eq.mass || 0), 0)
      return t + typeMass
    }, 0)
    const cargoMass = guild.ship.cargo.reduce(
      (total, c) => total + Math.abs(c.amount || 0),
      0,
    )
    const totalMass = (guild.ship.mass || 0) + equipmentMass + cargoMass

    return totalMass
  }

  guild.ship.maxMass = () => {
    return guild.ship.equipment.find((e) => e.equipmentType === `chassis`)
      .list[0].maxMass
  }
}
