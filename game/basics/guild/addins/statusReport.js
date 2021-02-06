const {
  bearingToDegrees,
  bearingToArrow,
  percentToTextBars,
} = require('../../../../common')

module.exports = (guild) => {
  guild.ship.statusReport = async () => {
    const fields = [],
      actions = await guild.ship.getAvailableActions()

    const fuel = guild.ship.cargo.find((c) => c.type === 'fuel').amount

    fields.push({
      name: `⏩ Speed`,
      value: guild.ship.status.stranded
        ? 'Out of Fuel!'
        : guild.ship.speed
        ? guild.ship.speed.toFixed(2) + ' ' + process.env.SPEED_UNIT
        : 'Stopped',
    })

    fields.push({
      name: `🧭 Bearing`,
      value:
        bearingToArrow(guild.ship.bearing) +
        ' ' +
        bearingToDegrees(guild.ship.bearing).toFixed(0) +
        ' degrees',
    })

    fields.push({
      name: `📍 Location`,
      value:
        guild.ship.location.map((l) => l.toFixed(2)).join(', ') +
        ' ' +
        process.env.DISTANCE_UNIT,
    })

    fields.push({
      name: `🇨🇭 Health`,
      value:
        percentToTextBars(guild.ship.hp) +
        '\n' +
        `${Math.ceil(
          guild.ship.hp * guild.ship.maxHp(),
        )}/${guild.ship.maxHp()} ${process.env.HEALTH_UNIT}`,
    })

    fields.push({
      name: `⛽️ Fuel`,
      value:
        fuel.toFixed(1) +
        ' ' +
        process.env.WEIGHT_UNIT_PLURAL +
        (guild.ship.speed
          ? `\n(${Math.floor(fuel / guild.ship.fuelUsePerTick())} ${
              process.env.TIME_UNIT
            } at\ncurrent speed)`
          : ''),
    })

    fields.push({
      name: `⚡️Power`,
      value:
        percentToTextBars(guild.ship.power / guild.ship.maxPower()) +
        '\n' +
        guild.ship.power.toFixed(1) +
        '/' +
        guild.ship.maxPower().toFixed(0) +
        process.env.POWER_UNIT +
        ` (${Math.round((guild.ship.power / guild.ship.maxPower()) * 100)}%)`,
    })

    return {
      headline: `All systems normal.`, // todo
      fields,
      actions,
    }
  }
}
