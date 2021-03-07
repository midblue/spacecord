module.exports = (guild) => {
  guild.ship.currentHp = () => {
    const equipmentHp = guild.ship.equipment.reduce((t, { list }) => {
      const typeHp = list.reduce(
        (total, eq) => total + (eq.baseHp || 0) * (eq.repair || 0),
        0,
      )
      return t + typeHp
    }, 0)
    return equipmentHp
  }

  guild.ship.maxHp = () => {
    return guild.ship.equipment.reduce(
      (total, { list }) =>
        total + list.reduce((total2, eq) => total2 + (eq.baseHp || 0), 0),
      0,
    )
  }
}
