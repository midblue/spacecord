const story = require('../../story/story')
const Discord = require('discord.js-light')
const { percentToTextBars } = require('../../../../common')

module.exports = (guild) => {
  guild.ship.takeDamage = ({
    miss = false,
    targetEquipment,
    damage,
    attacker,
    weapon,
    attackDistance,
    advantageDamageMultiplier,
    advantageAccuracyMultiplier,
  }) => {
    const ship = guild.ship

    const outputEmbed = new Discord.MessageEmbed().setColor(
      miss ? process.env.SUCCESS_COLOR : process.env.FAILURE_COLOR,
    )
    outputEmbed.setTitle(
      miss
        ? `Dodged an Attack From ${attacker.name}!`
        : `Hit by an Attack From ${attacker.name}!`,
    )

    outputEmbed.fields = [
      {
        name: 'Attack Weapon',
        value: weapon.emoji + ' ' + weapon.modelDisplayName,
        inline: true,
      },
      {
        name: 'Attack Range',
        value: attackDistance.toFixed(3) + ' ' + process.env.DISTANCE_UNIT,
        inline: true,
      },
    ]
    if (!miss) outputEmbed.footer = story.defend.advice()

    let damageTaken = []
    let damageRemaining = damage
    let totalDamageTaken = 0

    if (!miss) {
      // deal damage to armor
      let unbrokenArmor = ship.equipment.armor.filter((a) => a.repair)
      let randomUnbrokenArmor =
        unbrokenArmor[Math.floor(unbrokenArmor.length * Math.random())]
      while (damageRemaining && randomUnbrokenArmor) {
        if (
          Math.random() <
          randomUnbrokenArmor.armorCoverage * randomUnbrokenArmor.repair
        ) {
          const armorHp =
            randomUnbrokenArmor.repair * randomUnbrokenArmor.baseHp
          const previousRepair = randomUnbrokenArmor.repair
          const blockedByArmor = Math.min(
            armorHp / randomUnbrokenArmor.damageToArmorMultiplier,
            damageRemaining,
          )
          damageRemaining -= blockedByArmor
          const damageToArmor =
            blockedByArmor * randomUnbrokenArmor.damageToArmorMultiplier
          const damageToArmorAsPercent =
            damageToArmor / randomUnbrokenArmor.baseHp
          randomUnbrokenArmor.repair -= damageToArmorAsPercent
          if (randomUnbrokenArmor.repair <= 0) randomUnbrokenArmor.repair = 0
          damageTaken.push({
            equipment: randomUnbrokenArmor,
            damage:
              (previousRepair - randomUnbrokenArmor.repair) *
              randomUnbrokenArmor.baseHp,
            negated:
              blockedByArmor -
              (previousRepair - randomUnbrokenArmor.repair) *
                randomUnbrokenArmor.baseHp,
            wasDisabled: randomUnbrokenArmor.repair === 0,
          })
        }

        // reset for next time
        unbrokenArmor = unbrokenArmor.filter((a) => a !== randomUnbrokenArmor)
        randomUnbrokenArmor =
          unbrokenArmor[Math.floor(unbrokenArmor.length * Math.random())]
      }

      // deal damage to equipment
      while (ship.currentHp() && damageRemaining) {
        let target =
          targetEquipment && targetEquipment.repair ? targetEquipment : null
        if (!target) {
          let allUnbrokenEquipmentAsArray = []
          Object.values(guild.ship.equipment).forEach((eqArray) =>
            allUnbrokenEquipmentAsArray.push(...eqArray),
          )
          allUnbrokenEquipmentAsArray = allUnbrokenEquipmentAsArray.filter(
            (e) => e.repair && e.baseHp,
          )
          target =
            allUnbrokenEquipmentAsArray[
              Math.floor(allUnbrokenEquipmentAsArray.length * Math.random())
            ]
        }
        const previousEqRepair = target.repair
        const damageToEquipmentAsPercent = damageRemaining / target.baseHp

        target.repair -= damageToEquipmentAsPercent
        if (target.repair <= 0) target.repair = 0
        damageDealt = (previousEqRepair - target.repair) * target.baseHp
        damageRemaining -= damageDealt
        if (damageRemaining < 0.000001) damageRemaining = 0

        damageTaken.push({
          equipment: target,
          damage: damageDealt,
          wasDisabled: target.repair === 0,
        })
      }

      totalDamageTaken = damageTaken.reduce((total, d) => total + d.damage, 0)

      // add hit fields to embed
      const currentHp = guild.ship.currentHp(),
        maxHp = guild.ship.maxHp()
      outputEmbed.fields.push(
        ...[
          {
            name: 'Damage Taken',
            value: Math.round(totalDamageTaken * 10) / 10,
            inline: true,
          },
          {
            name: 'Ship Health',
            value:
              percentToTextBars(currentHp / maxHp) +
              '\n' +
              `${Math.round(currentHp)}/${Math.round(maxHp)} ${
                process.env.HEALTH_UNIT
              }`,
            inline: true,
          },
          {
            name: 'Damage Breakdown',
            value: damageTaken
              .map(
                (d) =>
                  `${d.equipment.emoji} ${
                    d.equipment.modelDisplayName
                  } ${percentToTextBars(d.equipment.repair)}
 ↳ ${Math.round(d.damage * 10) / 10} damage (${
                    Math.round(d.equipment.repair * d.equipment.baseHp * 10) /
                    10
                  }/${Math.round(d.equipment.baseHp * 10) / 10} hp)${
                    d.negated
                      ? ` (${Math.round(d.negated * 10) / 10} damage negated)`
                      : ''
                  }${d.wasDisabled ? ` (**Disabled!**)` : ''}`,
              )
              .join('\n'),
          },
        ],
      )
    }

    outputEmbed.description = miss
      ? story.defend.miss(attacker, weapon, advantageAccuracyMultiplier)
      : story.defend.hit(
          attacker,
          weapon,
          advantageDamageMultiplier,
          totalDamageTaken,
        )
    guild.ship.logEntry(outputEmbed.description)

    const reactions = guild.ship.getActionsOnOtherShip(attacker)

    // notify
    guild.pushToGuild(outputEmbed, null, reactions)

    const destroyedShip = ship.checkForDeath()

    return {
      damageTaken,
      totalDamageTaken,
      destroyedShip,
    }
  }
}
