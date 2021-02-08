const {
  bearingToDegrees,
  bearingToArrow,
  percentToTextBars,
} = require('../../../../common')
const { entries } = require('../../../../discord/defaults/typingTestOptions')
const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.scanOtherShip = (otherShip) => {
    // todo check if in range

    let fields = [{ name: 'Name', value: otherShip.name }],
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

    const scanRes = scanner.use(otherShip)
    if (!scanRes.ok) {
      didSucceed = false
      message.push(scanRes.message)
    }
    if (didSucceed) {
      fields = scanRes.result
      fields.push({
        name: '🔍 Your Scanner',
        value: scanner.modelDisplayName,
      })
      fields.push({
        name: '⚡️Your Ship Power',
        value: guild.ship.power + ' ' + process.env.POWER_UNIT,
      })
    }
    const enemyTotalEngineeringLevel = otherShip.members.reduce(
      (total, m) => total + (m.level?.engineering || 0),
      0,
    )
    if ((scanner.scanUndetectibility || 0) < enemyTotalEngineeringLevel) {
      message.push(story.scanShip.ourScanDetected())
      otherShip.pushToGuild(story.scanShip.detected(didSucceed, scanner))
      otherShip.logEntry(story.scanShip.detected(didSucceed, scanner))
    }

    return {
      ok: true,
      fields,
      message,
    }
  }
}
