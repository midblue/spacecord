const { bearingToDegrees, bearingToArrow } = require('../../../../common')

module.exports = (guild) => {
  guild.ship.getDirectionString = () => {
    const arrow = bearingToArrow(guild.ship.bearing)
    const degrees = bearingToDegrees(guild.ship.bearing)
    return arrow + ' ' + degrees.toFixed(0) + ' degrees'
  }
}
