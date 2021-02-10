module.exports = (guild) => {
  guild.ship.currentHp = () => {
    const equipmentHp = Object.keys(guild.ship.equipment).reduce(
      (t, eqType) => {
        const typeHp = guild.ship.equipment[eqType].reduce(
          (total, eq) => total + (eq.baseHp || 0) * eq.repair,
          0,
        )
        return t + typeHp
      },
      0,
    )

    return equipmentHp
  }

  guild.ship.maxHp = () => {
    return Object.keys(guild.ship.equipment).reduce(
      (total, type) =>
        total +
        guild.ship.equipment[type].reduce(
          (total2, eq) => total2 + eq.baseHp,
          0,
        ),
      0,
    )
  }
}
