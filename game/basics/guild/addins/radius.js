module.exports = (guild) => {
  guild.ship.interactRadius = () => {
    return guild.ship.equipment.find((e) => e.equipmentType === `chassis`)
      .list[0].interactRadius
  }

  guild.ship.maxActionRadius = () => {
    return Math.max(
      guild.ship.attackRadius(),
      guild.ship.tractorRadius(),
      guild.ship.shipScanRadius(),
    )
  }

  guild.ship.attackRadius = () => {
    const maxWeaponRange = (guild.ship.canAttack() || []).reduce(
      (max, w) => Math.max(max, w.range || 0),
      0,
    )
    return maxWeaponRange
  }

  guild.ship.tractorRadius = () => {
    return guild.ship.interactRadius()
  }

  guild.ship.shipScanRadius = () => {
    return (
      guild.ship.equipment.find((e) => e.equipmentType === `scanner`).list[0]
        ?.range || 0
    )
  }
}
