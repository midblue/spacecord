const { ship } = require('../../story/story')
const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.takeDamage = ({
    miss = false,
    targetEquipment,
    damageToTarget,
    blockedByArmor,
    attacker,
    weapon,
    advantageDamageMultiplier,
    advantageAccuracyMultiplier,
  }) => {
    const ship = guild.ship

    // notify

    // deal damage to equipment
    const damageToEquipmentAsPercent = damageToTarget / targetEquipment.baseHp
    targetEquipment.repair -= damageToEquipmentAsPercent
    if (targetEquipment.repair < 0) targetEquipment.repair = 0 // todo damage rolls over to other equipment

    if (blockedByArmor && ship.equipment.armor) {
      // deal damage to armor
      const unbrokenArmor = ship.armor.filter((a) => a.repair)
      const randomUnbrokenArmor =
        unbrokenArmor[Math.floor(unbrokenArmor.length * Math.random())]
      if (!randomUnbrokenArmor)
        console.log('?????', guild, guild.equipment.armor)
      else {
        const damageToArmor =
          blockedByArmor * randomUnbrokenArmor.damageToArmorMultiplier
        const damageToArmorAsPercent =
          damageToArmor / randomUnbrokenArmor.baseHp
        randomUnbrokenArmor.repair -= damageToArmorAsPercent
        if (randomUnbrokenArmor.repair < 0) randomUnbrokenArmor.repair = 0 // todo damage rolls over to other equipment
      }
    }

    ship.checkForDeath()

    console.log({
      miss,
      targetEquipment,
      damageToTarget,
      blockedByArmor,
      attacker: attacker.name,
      weapon,
      advantageDamageMultiplier,
      advantageAccuracyMultiplier,
    })
  }
}
