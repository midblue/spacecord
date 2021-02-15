const {
  capitalize,
  usageTag,
  percentToTextBars,
  msToTimeString,
} = require('../../../../common')
const equipmentTypes = require('../../equipment/equipmentTypes')

module.exports = (guild) => {
  guild.ship.addPart = (part, cost) => {
    let soldCredits = 0,
      soldPart
    if (equipmentTypes[part.type].singleton) {
      soldPart = guild.ship.equipment[part.type][0]
      if (soldPart) {
        soldCredits = Math.round(
          soldPart.baseCost * 0.5 * (cost / part.baseCost),
        ) // half price, adjusted to the deal that you're getting now
        guild.ship.credits += soldCredits
      }
    }

    guild.ship.credits -= cost

    part.repair = 1
    part.repaired = Date.now()

    if (equipmentTypes[part.type].singleton)
      guild.ship.equipment[part.type] = [part]
    else {
      if (!guild.ship.equipment[part.type]) guild.ship.equipment[part.type] = []
      guild.ship.equipment[part.type].push(part)
    }

    return { soldCredits, soldPart }
  }

  guild.ship.addPart = (part, cost) => {
    let soldCredits = 0,
      soldPart
    if (equipmentTypes[part.type].singleton) {
      soldPart = guild.ship.equipment[part.type][0]
      if (soldPart) {
        soldCredits = Math.round(
          soldPart.baseCost * 0.5 * (cost / part.baseCost),
        ) // half price, adjusted to the deal that you're getting now
        guild.ship.credits += soldCredits
      }
    }

    guild.ship.credits -= cost

    part.repair = 1
    part.repaired = Date.now()

    if (equipmentTypes[part.type].singleton)
      guild.ship.equipment[part.type] = [part]
    else {
      if (!guild.ship.equipment[part.type]) guild.ship.equipment[part.type] = []
      guild.ship.equipment[part.type].push(part)
    }

    return { soldCredits, soldPart }
  }

  guild.ship.removePart = (part, cost) => {
    guild.ship.credits += cost
    guild.ship.equipment[part.type].splice((p) => p === part, 1)
  }

  guild.ship.getEquipmentData = (e) => {
    const fields = []

    if (e.repair !== undefined)
      fields.push({
        name: '🔧 Repair',
        value:
          percentToTextBars(e.repair) +
          '\n' +
          `${Math.round(e.repair * e.baseHp * 10) / 10}/${
            Math.round(e.baseHp * 10) / 10
          } HP`,
      })

    if (e.weight)
      fields.push({
        name: '🎒 Weight',
        value: `${Math.round(e.weight * 10) / 10} ${process.env.WEIGHT_UNITS}`,
      })

    if (e.maxWeight)
      fields.push({
        name: '🎒 Carrying Capacity',
        value: `${Math.round(e.maxWeight * 10) / 10} ${
          process.env.WEIGHT_UNITS
        }`,
      })
    if (e.agility)
      fields.push({
        name: '🐇 Agility',
        value: e.agility * 100 + '%',
      })

    if (e.maxSpeed)
      fields.push({
        name: '💨 Unburdened Speed',
        value:
          (e.maxSpeed * e.repair).toFixed(2) +
          ' ' +
          process.env.DISTANCE_UNIT +
          '/' +
          process.env.TIME_UNIT,
      })

    if (e.directions)
      fields.push({
        name: '🧭 Movement Directions',
        value: e.directions,
      })
    if (e.powerLevels)
      fields.push({
        name: '⏩ Speed Levels',
        value: e.powerLevels,
      })

    if (e.damageToArmorMultiplier)
      fields.push({
        name: '🛡 Damage Reduction',
        value: Math.round((1 - e.damageToArmorMultiplier) * 100) + '%',
      })

    if (e.powerUse)
      fields.push({
        name: '⚡Power Use',
        value: e.powerUse + ' ' + process.env.POWER_UNIT,
      })

    if (e.fuelUse)
      fields.push({
        name: '⛽️ Fuel Use',
        value:
          e.fuelUse +
          ' ' +
          (e.fuelUse === 1 ? '(normal)' : e.fuelUse < 1 ? '(low)' : '(high)'),
      })

    if (e.requirements)
      fields.push({
        name: '💪 Use Requirements',
        value: Object.keys(e.requirements).map(
          (r) => `${capitalize(r)}: Level ${e.requirements[r]}`,
        ),
      })

    if (e.capacity)
      // battery
      fields.push({
        name: '🔋 Capacity',
        value: e.capacity + ' ' + process.env.POWER_UNIT,
      })

    if (e.damage)
      fields.push({
        name: '⚔️ Base Damage',
        value: e.damage,
      })

    if (e.range)
      fields.push({
        name: '📡 Max Range',
        value: e.range + ' ' + process.env.DISTANCE_UNIT,
      })

    if (e.interactRadius)
      fields.push({
        name: '👉 Interact Radius',
        value: e.interactRadius + ' ' + process.env.DISTANCE_UNIT,
      })

    if (e.rechargeTime !== undefined)
      fields.push({
        name: '⏱ Cooldown',
        value:
          msToTimeString(e.rechargeTime * process.env.STEP_INTERVAL) +
          ' (real-time)',
      })

    if (e.durabilityLostOnUse)
      fields.push({
        name: '🩹 Durability Loss',
        value:
          '-' + Math.round(e.durabilityLostOnUse * 1000) / 10 + '% per use',
      })

    if (e.maxGarble)
      fields.push({
        name: '💬 Minimum Message Clarity',
        value: Math.round((1 - e.maxGarble) * 100) + '%',
      })

    if (e.scanUndetectability)
      fields.push({
        name: '🤫 Scan Sneakiness',
        value: Math.round(e.scanUndetectability),
      })

    if (e.broadcastCapabilities)
      fields.push({
        name: '📣 Broadcast Types',
        value: e.broadcastCapabilities.map((b) => capitalize(b)).join(', '),
      })

    const repairDiff = e.repairDifficulty || 1
    fields.push({
      name: '🔧 Repair Difficulty',
      value:
        repairDiff +
        ' ' +
        (repairDiff === 1 ? '(normal)' : repairDiff < 1 ? '(easy)' : '(hard)'),
    })

    if (e.repairRequirements)
      fields.push({
        name: '🔧 Repair Requirements',
        value: Object.keys(e.repairRequirements).map(
          (r) => `${capitalize(r)}: Level ${e.repairRequirements[r]}`,
        ),
      })

    return fields
  }
}
