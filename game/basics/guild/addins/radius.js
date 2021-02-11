const { usageTag, distance } = require('../../../../common')
const attackShip = require('../../../../discord/actions/attackShip')
const runGuildCommand = require('../../../../discord/actions/runGuildCommand')
const staminaRequirements = require('../../crew/staminaRequirements')
const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.maxActionRadius = () => {
    return Math.max(guild.ship.attackRadius(), guild.ship.tractorRadius())
  }

  guild.ship.attackRadius = () => {
    const maxWeaponRange = guild.ship.equipment.weapon.reduce(
      (max, w) => Math.max(max, w.range || 0),
      0,
    )
    return maxWeaponRange
  }

  guild.ship.tractorRadius = () => {
    return guild.ship.interactRadius
  }
}
