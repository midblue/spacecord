const { bearingToDegrees, bearingToArrow } = require('../../../../common')

module.exports = (guild) => {
  guild.ship.scanArea = () => {
    const telemetry = guild.ship.equipment.telemetry.find((upgrade) =>
      upgrade.id.startsWith('telemetry'),
    )
    let range = guild.ship.baseScanRange
    if (telemetry) range = telemetry.range
    const scanResult = guild.context.scanArea({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range,
      excludeIds: guild.guildId,
    })

    let haveEnoughPower = true
    if (telemetry) haveEnoughPower = guild.ship.usePower(telemetry.powerUse)

    if (!telemetry || !haveEnoughPower) {
      let preMessage = `Since you're out of power,`
      if (!telemetry) preMessage = `Since you don't have any telemetry`
      return {
        message:
          preMessage +
          ` you look out out the window. You see ${
            scanResult.length
              ? scanResult.length +
                ` unidentifiable thing${
                  scanResult.length === 1 ? '' : 's'
                } out there in the dark.`
              : 'nothing but the inky void of space.'
          }` +
          haveEnoughPower
            ? ''
            : ' Maybe you should think about generating some power.',
      }
    }

    const telemetryResult = telemetry.use({
      scanResult,
      x: guild.ship.location[0],
      y: guild.ship.location[1],
    })

    const data = [
      {
        name: 'Our Coordinates',
        value:
          `${guild.ship.location[0].toFixed(
            2,
          )}, ${guild.ship.location[1].toFixed(2)} ` +
          process.env.DISTANCE_UNIT,
      },
      {
        name: 'Our Bearing',
        value:
          bearingToArrow(guild.ship.bearing) +
          ' ' +
          bearingToDegrees(guild.ship.bearing).toFixed(0) +
          ' degrees',
      },
      {
        name: 'Our Speed',
        value: `${guild.ship.speed.toFixed(2)} ` + process.env.SPEED_UNIT,
      },
      {
        name: 'Scan Radius',
        value: `${telemetry.range} ${process.env.DISTANCE_UNIT}`,
      },
      {
        name: 'Power Used on Scan',
        value: telemetry.powerUse + process.env.POWER_UNIT,
      },
      {
        name: 'Next Update',
        value: `${Math.ceil(guild.context.timeUntilNextTick() / 1000 / 60)}m`,
      },
    ]
    return {
      message: `Scan Results`,
      ...telemetryResult,
      data,
    }
  }
}
