const { usageTag, distance } = require('../../../../common')
const attackShip = require('../../../../discord/actions/attackShip')
const runGuildCommand = require('../../../../discord/actions/runGuildCommand')
const staminaRequirements = require('../../crew/staminaRequirements')

module.exports = (guild) => {
  guild.ship.maxActionRadius = () => {
    return Math.max(guild.ship.attackRadius(), guild.ship.interactRadius)
  }

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
        value: scanner.displayName,
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

  guild.ship.getActionsOnOtherShip = (otherShip) => {
    const actions = []

    const dist = distance(...guild.ship.location, ...otherShip.location)

    if (
      guild.ship.equipment.scanner &&
      guild.ship.equipment.scanner[0] &&
      dist <= guild.ship.equipment.scanner[0].range
    )
      actions.push({
        emoji: '🔍',
        label:
          'Scan Ship ' +
          usageTag(guild.ship.equipment.scanner[0].powerUse, 'scanShip'),
        async action({ user, msg, guild }) {
          await runGuildCommand({
            commandTag: 'scanShip',
            author: user,
            msg,
            props: { otherShip, guild },
          })
        },
      })

    if (dist <= guild.ship.attackRadius())
      actions.push({
        emoji: '⚔️',
        label: 'Start Attack Vote ' + usageTag(0, 'poll'),
        async action({ msg, guild }) {
          attackShip({ msg, guild, otherShip })
        },
      })

    return actions
  }

  guild.ship.getTargetsOnOtherShip = (otherShip) => {
    return []
    // todo
  }
}
