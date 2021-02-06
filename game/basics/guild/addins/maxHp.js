module.exports = (guild) => {
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
