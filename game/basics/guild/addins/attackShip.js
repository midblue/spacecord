const { distance } = require('../../../../common')
const story = require('../../story/story')
const Discord = require('discord.js-light')

const advantageBeginsHavingEffectAt = 5

module.exports = (guild) => {
  guild.ship.attackShip = (enemyShip, weapon, target) => {
    guild.ship.lastAttack = Date.now()

    const outputEmbed = new Discord.MessageEmbed()

    const attackDistance = distance(
      ...guild.ship.location,
      ...enemyShip.location,
    )
    const enemyTotalPilotingLevel = enemyShip.members.reduce(
      (total, m) => total + m.level?.piloting || 0,
      0,
    )
    const ourTotalMunitionsLevel = guild.ship.members.reduce(
      (total, m) => total + m.level?.munitions || 0,
      0,
    )
    const advantage = ourTotalMunitionsLevel - enemyTotalPilotingLevel
    const randomizedAdvantage = advantage + advantage * (Math.random() - 0.5) // adjusts it from .5 to 1.5 of the advantage
    const adjustedAccuracy = weapon.hitPercent(attackDistance)
    const adjustedDamage = weapon.damage * weapon.repair
    const enemyArmorDamageReduction = (enemyShip.equipment.armor || []).reduce(
      (total, armor) => total + armor.damageReduction * armor.repair,
      0,
    )

    // calculate accuracy
    let advantageAccuracyMultiplier = 1
    if (randomizedAdvantage > advantageBeginsHavingEffectAt * Math.random())
      // crit
      advantageAccuracyMultiplier = Math.min(1 + randomizedAdvantage / 100, 2)
    else if (
      randomizedAdvantage <
      -1 * advantageBeginsHavingEffectAt * Math.random()
    )
      // glancing
      advantageAccuracyMultiplier = Math.max(1 - randomizedAdvantage / 100, 0.5)

    const finalAccuracy = adjustedAccuracy * advantageAccuracyMultiplier
    const accuracyTarget = Math.random()
    const didHit = finalAccuracy > accuracyTarget
    console.log('hit check:', didHit, finalAccuracy, accuracyTarget)

    outputEmbed.fields = [
      {
        name: 'Weapon',
        value: weapon.emoji + ' ' + weapon.modelDisplayName,
        inline: true,
      },
      {
        name: 'Range',
        value: attackDistance.toFixed(3) + ' ' + process.env.DISTANCE_UNIT,
        inline: true,
      },
      {
        name: 'Base Hit %',
        value: Math.round(adjustedAccuracy * 100) + '%',
        inline: true,
      },
    ]

    // miss
    if (!didHit) {
      // notify other guild
      enemyShip.takeDamage({
        miss: true,
        targetEquipment: target,
        attacker: guild.ship,
        weapon,
        advantageAccuracyMultiplier,
      })

      outputEmbed.setColor(process.env.FAILURE_COLOR)
      outputEmbed.description = story.attack.miss(
        weapon,
        accuracyTarget - finalAccuracy < 0.1,
        advantageAccuracyMultiplier,
      )
      return {
        ok: false,
        message: outputEmbed,
      }
    }

    // calculate damage,
    let advantageDamageMultiplier = 1
    if (randomizedAdvantage > advantageBeginsHavingEffectAt * Math.random())
      // crit
      advantageDamageMultiplier = Math.min(1 + randomizedAdvantage / 100, 2)
    else if (
      randomizedAdvantage <
      -1 * advantageBeginsHavingEffectAt * Math.random()
    )
      // glancing
      advantageDamageMultiplier = Math.max(1 - randomizedAdvantage / 100, 0.3)

    const finalDamage = adjustedDamage * advantageDamageMultiplier

    // get target
    if (!target || target.repair === 0) {
      let allUnbrokenEnemyEquipmentAsArray = []
      Object.values(enemyShip.equipment).forEach((eqArray) =>
        allUnbrokenEnemyEquipmentAsArray.push(...eqArray),
      )
      allUnbrokenEnemyEquipmentAsArray = allUnbrokenEnemyEquipmentAsArray.filter(
        (e) => e.repair > 0,
      )
      target =
        allUnbrokenEnemyEquipmentAsArray[
          Math.floor(allUnbrokenEnemyEquipmentAsArray.length * Math.random())
        ]

      if (!target) {
        // todo enemy ship is destroyed at this point
      }
    }

    let damageToEquipment = finalDamage,
      damageToArmor = 0,
      didDisableEquipment = false,
      didDisableArmor = false
    if (target.type === 'armor' || !enemyArmorDamageReduction) {
      // apply damage directly
      enemyShip.takeDamage({
        targetEquipment: target,
        damageToTarget: finalDamage,
        attacker: guild.ship,
        weapon,
        advantageDamageMultiplier,
        advantageAccuracyMultiplier,
      })

      didDisableEquipment = target.repair === 0
    } else {
      damageToEquipment = finalDamage - enemyArmorDamageReduction
      if (damageToEquipment < 0) damageToEquipment = 0
      damageToArmor = Math.min(finalDamage, enemyArmorDamageReduction)
      // apply damage to both equipment and armor
      enemyShip.takeDamage({
        targetEquipment: target,
        damageToTarget: damageToEquipment,
        blockedByArmor: damageToArmor,
        attacker: guild.ship,
        weapon,
        advantageDamageMultiplier,
        advantageAccuracyMultiplier,
      })
      didDisableEquipment = target.repair === 0
      didDisableArmor =
        enemyArmorDamageReduction &&
        enemyShip.equipment.armor.reduce((total, a) => total + a.repair, 0) ===
          0
    }

    outputEmbed.setColor(process.env.SUCCESS_COLOR)
    outputEmbed.description = story.attack.hit(
      weapon,
      target,
      advantageDamageMultiplier,
      damageToEquipment,
      damageToArmor,
      didDisableEquipment,
      didDisableArmor,
    )

    outputEmbed.fields.push(
      ...[
        {
          name: 'Equipment Hit',
          value: 'Enemy ' + target.emoji + ' ' + target.modelDisplayName,
          inline: true,
        },
        {
          name: 'Damage Dealt',
          value: finalDamage.toFixed(1),
          inline: true,
        },
      ],
    )
    if (didDisableEquipment)
      outputEmbed.fields.push({
        name: 'Disabled Equipment',
        value: target.emoji + ' ' + target.modelDisplayName,
        inline: true,
      })
    if (didDisableArmor)
      outputEmbed.fields.push({
        name: 'Disabled Armor',
        value: (enemyShip.equipment.armor || [])
          .map((a) => a.emoji + ' ' + a.modelDisplayName)
          .join('\n'),
        inline: true,
      })

    return {
      ok: true,
      message: outputEmbed,
    }
  }
}
