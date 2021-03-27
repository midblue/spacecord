const {
  distance,
  percentToTextBars,
  msToTimeString,
} = require(`../../../../common`)
const story = require(`../../story/story`)
const Discord = require(`discord.js-light`)

const advantageRandomChoiceRange = 15
const flatCritMultiplierDamageBoost = 0.3
const enemyNonVotingAdjustment = 0.8

module.exports = (guild) => {
  guild.ship.canAttack = () => {
    if (
      !guild.ship.equipment.find((e) => e.equipmentType === `weapon`)?.list
        ?.length
    )
      return false
    const canAttackWeapons = guild.ship.equipment
      .find((e) => e.equipmentType === `weapon`)
      .list.filter(
        (w) =>
          w.repair > 0 &&
          (w.lastAttack || 0) <
            Date.now() - (w.rechargeTime || 1) * TICK_INTERVAL,
      )
    if (!canAttackWeapons.length) return false
    return canAttackWeapons
  }

  guild.ship.nextAttackInMs = () => {
    return Math.max(
      0,
      guild.ship.equipment
        .find((e) => e.equipmentType === `weapon`)
        .list.reduce(
          (lowest, w) =>
            Math.min(lowest, (w.rechargeTime || 1) * TICK_INTERVAL) -
            (Date.now() - (w.lastAttack || 0)),
          0,
        ),
    )
  }

  guild.ship.checkForDeath = async () => {
    if (guild.ship.status.dead) return true
    const dead = guild.ship.currentHp() < 0.0001
    if (dead) {
      guild.ship.status.dead = true
      guild.message(story.ship.die(guild.ship))
      await guild.ship.jettisonAll(DEATH_LOOT_PERCENT)
    }
    return dead
  }

  guild.ship.attackShip = async ({
    enemyShip,
    weapon,
    target,
    collectiveMunitionsSkill,
  }) => {
    if (enemyShip.status.docked) {
      return { ok: false, message: story.attack.docked(enemyShip) }
    }

    if (!guild.ship.canAttack())
      return {
        ok: false,
        message: story.attack.tooSoon(
          msToTimeString(guild.ship.nextAttackInMs()),
        ),
      }
    weapon.lastAttack = Date.now()

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
    const adjustedAccuracy = weapon.hitPercent(attackDistance, enemyShip)
    const adjustedDamage = weapon.currentDamage()

    // calculate accuracy
    let advantageAccuracyMultiplier = 1
    // crit
    if (randomizedAdvantage > advantageRandomChoiceRange * Math.random()) {
      advantageAccuracyMultiplier = Math.min(1 + randomizedAdvantage / 100, 2)
    }
    // glancing
    else if (
      randomizedAdvantage <
      -1 * advantageRandomChoiceRange * Math.random()
    ) {
      advantageAccuracyMultiplier = Math.max(1 - randomizedAdvantage / 100, 0.5)
    }

    const finalAccuracy = adjustedAccuracy * advantageAccuracyMultiplier
    const accuracyTarget = Math.random()
    const didHit = finalAccuracy > accuracyTarget
    console.log(`hit check:`, didHit, finalAccuracy, accuracyTarget)

    outputEmbed.setTitle = didHit ? `Hit!` : `Miss!`
    outputEmbed.fields = [
      {
        name: `Weapon`,
        value: weapon.emoji + ` ` + weapon.displayName,
        inline: true,
      },
      {
        name: `Range`,
        value: attackDistance.toFixed(3) + ` ` + DISTANCE_UNIT,
        inline: true,
      },
      {
        name: `Base Hit %`,
        value: Math.round(adjustedAccuracy * 100) + `%`,
        inline: true,
      },
      {
        name: `Total Munitions Skill`,
        value: collectiveMunitionsSkill,
        inline: true,
      },
    ]

    // durability loss
    weapon.repair -= weapon.durabilityLostOnUse
    if (weapon.repair < 0) weapon.repair = 0

    // miss
    if (!didHit) {
      // notify other guild
      await enemyShip.takeDamage({
        miss: true,
        targetEquipment: target,
        attacker: guild.ship,
        weapon,
        attackDistance,
        advantageAccuracyMultiplier,
      })

      outputEmbed.setColor(FAILURE_COLOR)
      outputEmbed.description = story.attack.miss(
        weapon,
        accuracyTarget - finalAccuracy < 0.1,
        advantageAccuracyMultiplier,
      )

      await guild.context.spawnAttackRemnant({
        attacker: {
          name: guild.ship.name,
          shipId: guild.ship.id,
          location: [...guild.ship.location],
        },
        weaponId: weapon.id,
        damage: 0,
        destroyedShip: false,
        didHit: false,
        defender: {
          name: enemyShip.name,
          shipId: enemyShip.id,
          location: [...enemyShip.location],
        },
      })

      return {
        ok: false,
        message: outputEmbed,
      }
    }

    // calculate damage,
    let advantageDamageMultiplier = 1
    // crit
    if (randomizedAdvantage > advantageRandomChoiceRange * Math.random()) {
      advantageDamageMultiplier =
        Math.min(1 + randomizedAdvantage / 100, 2) +
        flatCritMultiplierDamageBoost
    }
    // glancing
    else if (
      randomizedAdvantage <
      -1 * advantageRandomChoiceRange * Math.random()
    ) {
      advantageDamageMultiplier =
        Math.max(1 - randomizedAdvantage / 100, 0.3) -
        flatCritMultiplierDamageBoost
    }

    const finalDamage = adjustedDamage * advantageDamageMultiplier

    const {
      damageTaken,
      totalDamageTaken,
      destroyedShip,
    } = await enemyShip.takeDamage({
      targetEquipment: target,
      damage: finalDamage,
      attacker: guild.ship,
      weapon,
      attackDistance,
      advantageDamageMultiplier,
      advantageAccuracyMultiplier,
    })

    outputEmbed.setColor(SUCCESS_COLOR)
    outputEmbed.description = story.attack.hit(
      weapon,
      advantageDamageMultiplier,
      totalDamageTaken,
      destroyedShip,
    )

    outputEmbed.fields.push(
      ...[
        {
          name: `Damage Breakdown`,
          value: damageTaken
            .map(
              (d) =>
                `${d.equipment.emoji} ${d.equipment.displayName}: ${
                  Math.round(d.damage * 10) / 10
                } damage${
                  d.negated
                    ? ` (${Math.round(d.negated * 10) / 10} damage negated)`
                    : ``
                }${d.wasDisabled ? ` (**Disabled!**)` : ``}`,
            )
            .join(`\n`),
        },
      ],
    )

    await guild.context.spawnAttackRemnant({
      attacker: {
        name: guild.ship.name,
        shipId: guild.ship.id,
        location: [...guild.ship.location],
      },
      weaponId: weapon.id,
      didHit,
      damage: totalDamageTaken,
      destroyedShip,
      defender: {
        name: enemyShip.name,
        shipId: enemyShip.id,
        location: [...enemyShip.location],
      },
    })

    return {
      ok: true,
      message: outputEmbed,
      didHit,
      weapon,
      damageTaken,
      totalDamageTaken,
      destroyedShip,
      damage: finalDamage,
    }
  }

  guild.ship.takeDamage = async ({
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
      miss ? SUCCESS_COLOR : FAILURE_COLOR,
    )
    outputEmbed.setTitle(
      miss
        ? `Dodged an Attack From 🚀${attacker.name}!`
        : `Hit by an Attack From 🚀${attacker.name}!`,
    )

    outputEmbed.fields = [
      {
        name: `Attack Weapon`,
        value: weapon.emoji + ` ` + weapon.displayName,
        inline: true,
      },
      {
        name: `Attack Range`,
        value: attackDistance.toFixed(3) + ` ` + DISTANCE_UNIT,
        inline: true,
      },
    ]
    if (!miss) outputEmbed.footer = story.defend.advice()

    const damageTaken = []
    let damageRemaining = damage
    let totalDamageTaken = 0

    if (!miss) {
      // deal damage to armor
      let unbrokenArmor = (
        ship.equipment.find((e) => e.equipmentType === `armor`)?.list || []
      ).filter((a) => a.repair)
      let randomUnbrokenArmor =
        unbrokenArmor[Math.floor(unbrokenArmor.length * Math.random())]
      const newUnbrokenFilter = (a) => a !== randomUnbrokenArmor
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
        unbrokenArmor = unbrokenArmor.filter(newUnbrokenFilter)
        randomUnbrokenArmor =
          unbrokenArmor[Math.floor(unbrokenArmor.length * Math.random())]
      }

      // deal damage to equipment
      while (ship.currentHp() && damageRemaining) {
        let target =
          targetEquipment && targetEquipment.repair ? targetEquipment : null
        if (!target) {
          let allUnbrokenEquipmentAsArray = []
          guild.ship.equipment.forEach(({ list }) =>
            allUnbrokenEquipmentAsArray.push(...(list || [])),
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
        if (target.onTakeDamage) target.onTakeDamage(guild)
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
      const currentHp = guild.ship.currentHp()
      const maxHp = guild.ship.maxHp()
      outputEmbed.fields.push(
        ...[
          {
            name: `Damage Taken`,
            value: Math.round(totalDamageTaken * 10) / 10,
            inline: true,
          },
          {
            name: `Ship Health`,
            value:
              percentToTextBars(currentHp / maxHp) +
              `\n` +
              `${Math.round(currentHp)}/${Math.round(maxHp)} ${HEALTH_UNIT}`,
            inline: true,
          },
          {
            name: `Damage Breakdown`,
            value:
              damageTaken
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
                        : ``
                    }${d.wasDisabled ? ` (**Disabled!**)` : ``}`,
                )
                .join(`\n`) || `No damage taken.`,
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
    // guild.ship.logEntry(outputEmbed.description)

    let reactions
    if (attacker.name !== `God`) {
      reactions = guild.ship.getActionsOnOtherShip(attacker)
    }

    // notify
    guild.message(outputEmbed, null, reactions)

    const destroyedShip = await guild.ship.checkForDeath()

    guild.saveToDb()

    return {
      damageTaken,
      totalDamageTaken,
      destroyedShip,
    }
  }
}
