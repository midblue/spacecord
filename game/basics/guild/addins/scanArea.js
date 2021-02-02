const { bearingToDegrees, bearingToArrow } = require('../../../../common')
const guildMessage = require('../../../../discord/events/guildMessage')

module.exports = (guild) => {
  guild.ship.scanArea = (eyesOnly) => {
    const telemetry = guild.ship.equipment.telemetry.find((upgrade) =>
      upgrade.id.startsWith('telemetry'),
    )

    let haveEnoughPower = true
    if (telemetry && !eyesOnly)
      haveEnoughPower = guild.ship.usePower(telemetry.powerUse)

    if (!telemetry || !haveEnoughPower || eyesOnly) {
      let range = guild.ship.baseScanRange
      const scanResult = guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range,
        excludeIds: guild.guildId,
      })
      let preMessage = `Since you're out of power,`
      if (!telemetry) preMessage = `Since you don't have any telemetry`
      if (eyesOnly) preMessage = `Deciding that technology is for the weak,`
      return {
        ok: false,
        message:
          preMessage +
          ` you look out out the window. 
You can see for about ${range}${process.env.DISTANCE_UNIT}.
You see ${
            scanResult.length
              ? scanResult.length +
                ` unidentifiable thing${
                  scanResult.length === 1 ? '' : 's'
                } out there in the dark.`
              : 'nothing but the inky void of space.'
          }` +
          (haveEnoughPower || eyesOnly
            ? ''
            : '\nMaybe you should think about generating some power.'),
      }
    }

    let range = guild.ship.baseScanRange
    if (telemetry) range = telemetry.range
    const scanResult = guild.context.scanArea({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range,
      excludeIds: guild.guildId,
    })

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

    const lowPower = telemetry.powerUse * 2 > guild.ship.power
    if (lowPower)
      data.push({
        name: `⚠️ Low Power ⚠️`,
        value: `${guild.ship.power + process.env.POWER_UNIT} remaining`,
      })

    return {
      ok: true,
      message: `Scan Results`,
      ...telemetryResult,
      data,
      lowPower,
    }
  }
}
