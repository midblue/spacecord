module.exports = (guild) => {
  guild.ship.attackRadius = () => {
    const maxWeaponRange = guild.ship.equipment.weapon.reduce(
      (max, w) => Math.max(max, w.range || 0),
      0,
    )
    return maxWeaponRange
  }
}
