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
}
