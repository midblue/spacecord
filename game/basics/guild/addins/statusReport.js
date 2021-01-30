const constants = require('../../../basics/constants')
const { bearingToDegrees, bearingToArrow } = require('../../../../common')

module.exports = (guild) => {
  guild.ship.statusReport = () => {
    const statusFields = []

    statusFields.push({
      name: `Location`,
      value: guild.ship.location.map((l) => l.toFixed(2)) + ' units',
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
      value: guild.ship.speed,
    })
    statusFields.push({
      name: `Ship Model`,
      value: guild.ship.modelDisplayName,
    })
    statusFields.push({
      name: `Fuel`,
      value: guild.ship.cargo.find((c) => c.type === 'fuel').amount.toFixed(1),
    })
    statusFields.push({
      name: `Power`,
      value:
        guild.ship.power.toFixed(1) + '/' + guild.ship.maxPower().toFixed(0),
    })
    statusFields.push({
      name: `Crew Members`,
      value: guild.ship.members.length,
    })
    statusFields.push({
      name: `Ship Age`,
      value:
        (
          (Date.now() - guild.ship.launched) *
          constants.REAL_TIME_TO_GAME_TIME_MULTIPLIER
        ).toFixed(2) + ' years',
    })
    return {
      headline: `All systems normal.`,
      fields: statusFields,
    }
  }
}
