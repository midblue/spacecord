module.exports = (guild) => {
  guild.ship.scanArea = () => {
    const telemetry = guild.ship.equipment.upgrade.find((upgrade) =>
      upgrade.id.startsWith('upgrade/telemetry'),
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
    return {
      message: `Scan Results`,
      ...telemetryResult,
    }
  }
}
