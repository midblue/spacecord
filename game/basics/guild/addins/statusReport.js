const {
  bearingToDegrees,
  bearingToArrow,
  percentToTextBars,
} = require('../../../../common')

module.exports = (guild) => {
  guild.ship.statusReport = () => {
    const statusFields = []

    statusFields.push({
      name: `Location`,
      value:
        guild.ship.location.map((l) => l.toFixed(2)) +
        ' ' +
        process.env.DISTANCE_UNIT,
    })

    statusFields.push({
      name: `Bearing`,
      value:
        bearingToArrow(guild.ship.bearing) +
        ' ' +
        bearingToDegrees(guild.ship.bearing).toFixed(0) +
        ' degrees',
    })
    statusFields.push({
      name: `Speed`,
      value: guild.ship.speed + ' ' + process.env.SPEED_UNIT,
    })

    statusFields.push({
      name: `Fuel`,
      value:
        guild.ship.cargo.find((c) => c.type === 'fuel').amount.toFixed(1) +
        ' ' +
        process.env.WEIGHT_UNIT_PLURAL,
    })
    statusFields.push({
      name: `Power`,
      value:
        percentToTextBars(guild.ship.power / guild.ship.maxPower()) +
        '\n' +
        guild.ship.power.toFixed(1) +
        '/' +
        guild.ship.maxPower().toFixed(0) +
        process.env.POWER_UNIT +
        ` (${Math.round((guild.ship.power / guild.ship.maxPower()) * 100)}%)`,
    })
    statusFields.push({
      name: `Crew Members`,
      value: guild.ship.members.length,
    })

    // todo put this into shipInfo command
    // statusFields.push({
    //   name: `Ship Model`,
    //   value: guild.ship.modelDisplayName,
    // })
    // statusFields.push({
    //   name: `Ship Age`,
    //   value:
    //     (
    //       (Date.now() - guild.ship.launched) *
    //       process.env.REAL_TIME_TO_GAME_TIME_MULTIPLIER *
    //       process.env.TIME_UNIT_LONG_MULTIPLIER
    //     ).toFixed(2) +
    //     ' ' +
    //     process.env.TIME_UNIT_LONG,
    // })

    return {
      headline: `All systems normal.`, // todo
      fields: statusFields,
    }
  }
}
