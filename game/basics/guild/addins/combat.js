const { distance } = require('../../../../common')
const story = require('../../story/story')
const Discord = require('discord.js-light')

const advantageRandomChoiceRange = 15,
  flatCritMultiplierDamageBoost = 0.3,
  enemyNonVotingAdjustment = 0.8

module.exports = (guild) => {
  guild.ship.canAttack = () => {
    return (guild.ship.lastAttack || 0) < guild.context.lastTick
  }

  guild.ship.attackRadius = () => {
    const maxWeaponRange = guild.ship.equipment.weapon.reduce(
      (max, w) => Math.max(max, w.range || 0),
      0,
    )
    return maxWeaponRange
  }

  guild.ship.checkForDeath = () => {
    const dead = guild.ship.currentHp <= 0.00001
    if (dead) guild.pushToGuild(`You're dead!`)
    return dead
  }

  guild.ship.attackShip = ({
    enemyShip,
    weapon,
    target,
    collectiveMunitionsSkill,
  }) => {
    guild.ship.lastAttack = Date.now()

    const outputEmbed = new Discord.MessageEmbed()

    const attackDistance = distance(
      ...guild.ship.location,
      ...enemyShip.location,
    )
    const enemyTotalPilotingLevel =
      enemyShip.members.reduce(
        (total, m) => total + m.level?.piloting || 0,
        0,
      ) * enemyNonVotingAdjustment
    const advantage = collectiveMunitionsSkill - enemyTotalPilotingLevel
    const randomizedAdvantage = advantage + advantage * (Math.random() - 0.5) // adjusts it from .5 to 1.5 of the advantage
    const adjustedAccuracy = weapon.hitPercent(attackDistance)
    const adjustedDamage = weapon.damage * weapon.repair

    // calculate accuracy
    let advantageAccuracyMultiplier = 1
    if (randomizedAdvantage > advantageRandomChoiceRange * Math.random())
      // crit
      advantageAccuracyMultiplier = Math.min(1 + randomizedAdvantage / 100, 2)
    else if (
      randomizedAdvantage <
      -1 * advantageRandomChoiceRange * Math.random()
    )
      // glancing
      advantageAccuracyMultiplier = Math.max(1 - randomizedAdvantage / 100, 0.5)

    const finalAccuracy = adjustedAccuracy * advantageAccuracyMultiplier
    const accuracyTarget = Math.random()
    const didHit = finalAccuracy > accuracyTarget
    console.log('hit check:', didHit, finalAccuracy, accuracyTarget)

    outputEmbed.setTitle = didHit ? 'Hit!' : 'Miss!'
    outputEmbed.fields = [
      {
        name: 'Weapon',
        value: weapon.emoji + ' ' + weapon.displayName,
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
        attackDistance,
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
    if (randomizedAdvantage > advantageRandomChoiceRange * Math.random())
      // crit
      advantageDamageMultiplier =
        Math.min(1 + randomizedAdvantage / 100, 2) +
        flatCritMultiplierDamageBoost
    else if (
      randomizedAdvantage <
      -1 * advantageRandomChoiceRange * Math.random()
    )
      // glancing
      advantageDamageMultiplier =
        Math.max(1 - randomizedAdvantage / 100, 0.3) -
        flatCritMultiplierDamageBoost

    const finalDamage = adjustedDamage * advantageDamageMultiplier

    const {
      damageTaken,
      totalDamageTaken,
      destroyedShip,
    } = enemyShip.takeDamage({
      targetEquipment: target,
      damage: finalDamage,
      attacker: guild.ship,
      weapon,
      attackDistance,
      advantageDamageMultiplier,
      advantageAccuracyMultiplier,
    })

    outputEmbed.setColor(process.env.SUCCESS_COLOR)
    outputEmbed.description = story.attack.hit(
      weapon,
      advantageDamageMultiplier,
      totalDamageTaken,
      destroyedShip,
    )

    outputEmbed.fields.push(
      ...[
        {
          name: 'Damage Breakdown',
          value: damageTaken
            .map(
              (d) =>
                `${d.equipment.emoji} ${d.equipment.displayName}: ${
                  Math.round(d.damage * 10) / 10
                } damage${
                  d.negated
                    ? ` (${Math.round(d.negated * 10) / 10} damage negated)`
                    : ''
                }${d.wasDisabled ? ` (**Disabled!**)` : ''}`,
            )
            .join('\n'),
        },
      ],
    )

    return {
      ok: true,
      message: outputEmbed,
    }
  }

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
        value: weapon.emoji + ' ' + weapon.displayName,
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
                    d.equipment.displayName
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

    guild.saveNewDataToDb()

    return {
      damageTaken,
      totalDamageTaken,
      destroyedShip,
    }
  }
}
