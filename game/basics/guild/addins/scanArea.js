const runGuildCommand = require(`../../../../discord/actions/runGuildCommand`)
const {
  bearingToDegrees,
  bearingToArrow,
  percentToTextBars,
  distance,
} = require(`../../../../common`)
const story = require(`../../story/story`)
const getCache = require(`../../../../discord/actions/getCache`)

module.exports = (guild) => {
  guild.ship.scanArea = async (eyesOnly) => {
    const messages = []
    const telemetry = (guild.ship.equipment.telemetry ||
      [])[0]

    let range =
      guild.ship.equipment.chassis[0].interactRadius

    let haveEnoughPower = true
    let powerRes = { ok: true }
    if (telemetry && !eyesOnly) {
      powerRes = guild.ship.usePower(telemetry.powerUse)
    }
    if (!powerRes.ok) haveEnoughPower = false
    if (powerRes.message) messages.push(powerRes.message)

    if (!telemetry || !haveEnoughPower || eyesOnly) {
      const scanResult = guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range,
        excludeIds: guild.id,
      })
      const thingsFoundCount = Object.values(
        scanResult,
      ).reduce((total, found) => (total += found.length), 0)
      let preMessage = `Since you're out of power,`
      if (!telemetry)
        preMessage = `Since you don't have any telemetry`
      if (eyesOnly)
        preMessage = `Deciding that technology is for the weak,`
      messages.push(
        preMessage +
          ` you look out out the window. 
You can see for about ${range} ${DISTANCE_UNIT}.
You see ${
            thingsFoundCount
              ? thingsFoundCount +
                ` unidentifiable thing${
                  thingsFoundCount === 1 ? `` : `s`
                } out there in the dark.`
              : `nothing but the inky void of space.`
          }` +
          (haveEnoughPower || eyesOnly
            ? ``
            : `\nMaybe you should think about generating some power.`),
      )
      return {
        ok: false,
        message: messages,
      }
    }

    if (telemetry) range = telemetry.range
    const scanResult = guild.context.scanArea({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range,
      excludeIds: guild.id,
    })

    for (const planet of scanResult.planets) {
      const seenPlanets = guild.ship.seen.planets
      if (!seenPlanets.find((p) => p === planet.name)) {
        seenPlanets.push(planet.name)
        guild.ship.logEntry(story.discovery.planet(planet))
        messages.push(story.discovery.planet(planet))
      }
    }

    const telemetryResult = await telemetry.use({
      scanResult,
      range,
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      guild,
    })

    const data = [
      {
        name: `⏩ Our Speed`,
        value: guild.ship.status.stranded
          ? `Out of Fuel!`
          : guild.ship.speed
          ? guild.ship.speed.toFixed(2) + ` ` + SPEED_UNIT
          : `Stopped`,
      },
      {
        name: `🧭 Our Bearing`,
        value:
          bearingToArrow(guild.ship.bearing) +
          ` ` +
          bearingToDegrees(guild.ship.bearing).toFixed(0) +
          ` degrees`,
      },
      {
        name: `📍 Our Location`,
        value:
          `${guild.ship.location[0].toFixed(
            2,
          )}, ${guild.ship.location[1].toFixed(2)} ` +
          DISTANCE_UNIT,
      },
      {
        name: `📡 Scan Radius`,
        value: `${telemetry.range} ${DISTANCE_UNIT}`,
      },
      {
        name: `⚡Power`,
        value:
          percentToTextBars(
            guild.ship.power / guild.ship.maxPower(),
          ) +
          `\n` +
          telemetry.powerUse +
          ` ` +
          POWER_UNIT +
          ` used`,
      },
      {
        name: `⏱ Next Update`,
        value: `${Math.ceil(
          guild.context.timeUntilNextTick() / 1000 / 60,
        )}m`,
      },
    ]

    const lowPower =
      telemetry.powerUse * 2 > guild.ship.power
    if (lowPower) {
      data.push({
        name: `⚠️ Low Power ⚠️`,
        value: `${guild.ship.power + POWER_UNIT} remaining`,
      })
    }

    // ---------------- actions ------------------
    const actions = []
    if (guild.ship.canInteract())
      actions.push({
        emoji: `👉`,
        label: `See/Interact With Nearby Objects`,
        async action({ user, msg }) {
          await runGuildCommand({
            msg,
            author: user,
            commandTag: `nearby`,
          })
        },
      })

    return {
      ok: true,
      message: messages,
      ...telemetryResult,
      data,
      lowPower,
      actions,
    }
  }
}
