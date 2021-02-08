const { distance } = require('../../../../common')
const story = require('../../story/story')
const Discord = require('discord.js-light')

const advantageAlwaysHasEffectAt = 15,
  flatCritMultiplierDamageBoost = 0.3

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

    // calculate accuracy
    let advantageAccuracyMultiplier = 1
    if (randomizedAdvantage > advantageAlwaysHasEffectAt * Math.random())
      // crit
      advantageAccuracyMultiplier = Math.min(1 + randomizedAdvantage / 100, 2)
    else if (
      randomizedAdvantage <
      -1 * advantageAlwaysHasEffectAt * Math.random()
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
    if (randomizedAdvantage > advantageAlwaysHasEffectAt * Math.random())
      // crit
      advantageDamageMultiplier =
        Math.min(1 + randomizedAdvantage / 100, 2) +
        flatCritMultiplierDamageBoost
    else if (
      randomizedAdvantage <
      -1 * advantageAlwaysHasEffectAt * Math.random()
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
                `${d.equipment.emoji} ${d.equipment.modelDisplayName}: ${
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
}
