const {
  bearingToDegrees,
  bearingToArrow,
  percentToTextBars,
} = require('../../../../common')
const { entries } = require('../../../../discord/defaults/typingTestOptions')
const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.scanOtherShip = (otherGuild) => {
    // todo check if in range

    let fields = [{ name: 'Name', value: otherGuild.ship.name }],
      message = [],
      ok = true

    const scanner = guild.ship.equipment.scanner?.[0]
    if (!scanner)
      return {
        fields,
        ok: false,
        message: story.scanShip.noScanner(),
      }

    const powerRes = guild.ship.usePower(scanner.powerUse)
    if (!powerRes.ok && powerRes.message)
      return {
        fields,
        ok: false,
        message: powerRes.message,
      }

    let didSucceed = scanner.repair > Math.random()
    if (!didSucceed)
      return {
        fields,
        ok: false,
        message: story.scanShip.repair(),
      }

    const scanRes = scanner.use(otherGuild.ship)
    if (!scanRes.ok) {
      didSucceed = false
      message.push(scanRes.message)
    }
    if (didSucceed) {
      fields = scanRes.result
      fields.push({
        name: '🔍 Scanner',
        value: scanner.modelDisplayName,
      })
      fields.push({
        name: '⚡️Your Power',
        value:
          percentToTextBars(guild.ship.power / guild.ship.maxPower()) +
          '\n' +
          scanner.powerUse +
          ' ' +
          process.env.POWER_UNIT +
          ' used',
      })
    }
    const enemyTotalEngineeringLevel = otherGuild.ship.members.reduce(
      (total, m) => total + (m.level?.engineering || 0),
      0,
    )
    if ((scanner.scanUndetectibility || 0) < enemyTotalEngineeringLevel) {
      message.push(story.scanShip.ourScanDetected())
      otherGuild.pushToGuild(story.scanShip.detected(didSucceed, scanner))
      otherGuild.ship.logEntry(story.scanShip.detected(didSucceed, scanner))
    }

    return {
      ok: true,
      fields,
      message,
    }
  }
}
