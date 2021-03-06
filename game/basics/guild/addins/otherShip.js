const { usageTag, distance } = require(`../../../../common`)
const attackShip = require(`../../../../discord/actions/attackShip`)
const runGuildCommand = require(`../../../../discord/actions/runGuildCommand`)
const staminaRequirements = require(`../../crew/staminaRequirements`)
const story = require(`../../story/story`)

module.exports = (guild) => {
  guild.ship.scanOtherShip = (otherShip) => {
    // todo check if in range

    let fields = [{ name: `Name`, value: otherShip.name }]
    const message = []
    const ok = true

    const scanner = guild.ship.equipment.find(
      (e) => e.equipmentType === `scanner`,
    ).list?.[0]
    if (!scanner) {
      return {
        fields,
        ok: false,
        message: story.scanShip.noScanner(),
      }
    }

    const previousRepair = scanner.repair
    scanner.useDurability()
    const repair = scanner.repair

    if (repair <= 0) {
      if (previousRepair !== repair) {
        guild.ship.logEntry(story.repair.breakdown(scanner.displayName))
      }
      return {
        fields,
        ok: false,
        message: story.repair.equipment.breakdown(scanner.displayName),
      }
    }

    const powerRes = guild.ship.usePower(scanner.powerUse)
    if (!powerRes.ok && powerRes.message) {
      return {
        fields,
        ok: false,
        message: powerRes.message,
      }
    }

    let didSucceed = scanner.repair > Math.random()
    if (!didSucceed) {
      return {
        fields,
        ok: false,
        message: story.scanShip.repair(),
      }
    }

    const scanRes = scanner.use(otherShip)
    if (!scanRes.ok) {
      didSucceed = false
      message.push(scanRes.message)
    }
    if (didSucceed) {
      fields = scanRes.result
      fields.push({
        name: `🔍 Your Scanner`,
        value: scanner.displayName,
      })
      // fields.push({
      //   name: `⚡️Your Ship Power`,
      //   value: guild.ship.power + ` ` + POWER_UNIT,
      // })
    }
    const enemyTotalEngineeringLevel = otherShip.members.reduce(
      (total, m) => total + (m.level?.engineering || 0),
      0,
    )
    if ((scanner.scanUndetectability || 0) < enemyTotalEngineeringLevel) {
      message.push(story.scanShip.ourScanDetected())
      otherShip.message(story.scanShip.detected(didSucceed, scanner))
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
      guild.ship.equipment.find((e) => e.equipmentType === `scanner`) &&
      guild.ship.equipment.find((e) => e.equipmentType === `scanner`).list[0] &&
      dist <=
        guild.ship.equipment.find((e) => e.equipmentType === `scanner`).list[0]
          .range
    ) {
      actions.push({
        emoji: `🔍`,
        label:
          `Scan Ship ` +
          usageTag(
            guild.ship.equipment.find((e) => e.equipmentType === `scanner`)
              .list[0].powerUse,
            `scanShip`,
          ),
        async action({ user, msg, guild }) {
          await runGuildCommand({
            commandTag: `scanShip`,
            author: user,
            msg,
            props: { otherShip, guild },
          })
        },
      })
    }

    if (!otherShip.status.docked && dist <= guild.ship.attackRadius()) {
      actions.push({
        emoji: `⚔️`,
        label: `Start Attack Vote ` + usageTag(0, `poll`),
        async action({ msg }) {
          attackShip({ msg, guild, otherShip })
        },
      })
    }

    return actions
  }

  guild.ship.getTargetsOnOtherShip = (otherShip) => {
    return []
    // todo
  }
}
