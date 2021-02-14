const {
  capitalize,
  bearingToDegrees,
  bearingToArrow,
  percentToTextBars,
  numberToEmoji,
  msToTimeString,
} = require('../../../../common')
const runGuildCommand = require('../../../../discord/actions/runGuildCommand')
const { ship } = require('../../story/story')

module.exports = (guild) => {
  guild.ship.statusReport = async () => {
    const fields = [],
      actions = await guild.ship.getAvailableActions()

    const fuel = guild.ship.cargo.find((c) => c.type === 'fuel').amount

    if (!guild.ship.status.docked) {
      fields.push({
        name: `⏩ Speed`,
        value: guild.ship.status.stranded
          ? 'Out of Fuel!'
          : guild.ship.speed
          ? guild.ship.speed.toFixed(2) + ' ' + process.env.SPEED_UNIT
          : 'Stopped',
      })

      fields.push({
        name: `🧭 Bearing`,
        value:
          bearingToArrow(guild.ship.bearing) +
          ' ' +
          bearingToDegrees(guild.ship.bearing).toFixed(0) +
          ' degrees',
      })
    } else {
      const dockedPlanet = guild.context.planets.find(
        (p) => p.name === guild.ship.status.docked,
      )
      fields.push({
        name: `Docked at:`,
        value: '🪐 ' + dockedPlanet.name,
      })
    }

    fields.push({
      name: `📍 Location`,
      value:
        guild.ship.location.map((l) => l.toFixed(2)).join(', ') +
        ' ' +
        process.env.DISTANCE_UNIT,
    })

    const currentHp = guild.ship.currentHp(),
      maxHp = guild.ship.maxHp()
    fields.push({
      name: `🇨🇭 Health`,
      value:
        percentToTextBars(currentHp / maxHp) +
        '\n' +
        `${Math.round(currentHp)}/${Math.round(maxHp)} ${
          process.env.HEALTH_UNIT
        }`,
    })

    fields.push({
      name: `⛽️ Fuel`,
      value:
        fuel.toFixed(1) +
        ' ' +
        process.env.WEIGHT_UNIT_PLURAL +
        (guild.ship.speed
          ? `\n(${Math.floor(fuel / guild.ship.fuelUsePerTick())} ${
              process.env.TIME_UNIT
            } at\ncurrent speed)`
          : ''),
    })

    fields.push({
      name: `⚡️Power`,
      value:
        percentToTextBars(guild.ship.power / guild.ship.maxPower()) +
        '\n' +
        guild.ship.power.toFixed(1) +
        '/' +
        guild.ship.maxPower().toFixed(0) +
        process.env.POWER_UNIT +
        ` (${Math.round(
          (guild.ship.power / guild.ship.maxPower() || 0) * 100,
        )}%)`,
    })

    fields.push({
      name: '⏱ Next Tick',
      value: msToTimeString(guild.context.timeUntilNextTick()) + ' (real-time)',
    })

    return {
      headline: `All systems normal.`, // todo
      fields,
      actions,
    }
  }

  guild.ship.shipInfo = () => {
    const fields = [],
      actions = []

    fields.push({
      name: `Chassis`,
      value:
        guild.ship.equipment.chassis[0].emoji +
        guild.ship.equipment.chassis[0].displayName,
    })

    const captain = guild.ship.captain
    fields.push({
      name: `👩‍✈️ Captain`,
      value: captain ? `%username%${captain}%` : 'No captain',
    })

    fields.push({
      name: `👵🏽 Age`,
      value:
        (
          (Date.now() - guild.ship.launched) *
          process.env.REAL_TIME_TO_GAME_TIME_MULTIPLIER *
          process.env.TIME_UNIT_LONG_MULTIPLIER
        ).toFixed(2) +
        ' ' +
        process.env.TIME_UNIT_LONG,
    })

    fields.push({
      name: `👩‍👩‍👧‍👦 Crew`,
      value: guild.ship.members.length + ' members',
    })

    if (guild.faction && guild.faction.color)
      fields.push({
        name: `Faction`,
        value: guild.faction.emoji + guild.faction.name,
      })

    fields.push({
      name: `👉 Interact Range`,
      value:
        guild.ship.equipment.chassis[0].interactRadius +
        ' ' +
        process.env.DISTANCE_UNIT,
    })

    fields.push({
      name: `🎒 Ship Weight`,
      value:
        percentToTextBars(
          guild.ship.getTotalWeight() /
            guild.ship.equipment.chassis[0].maxWeight,
        ) +
        '\n' +
        Math.round(guild.ship.getTotalWeight()) +
        '/' +
        Math.round(guild.ship.equipment.chassis[0].maxWeight) +
        ' ' +
        process.env.WEIGHT_UNIT_PLURAL,
    })

    fields.push({
      name: `🏎 Max Speed`,
      value:
        guild.ship.maxSpeed().toFixed(2) +
        ' ' +
        process.env.DISTANCE_UNIT +
        '/' +
        process.env.TIME_UNIT_SINGULAR +
        '\n' +
        '(At current weight)',
    })

    actions.push({
      emoji: '🔩',
      label: 'Equipment',
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          author: user,
          commandTag: 'equipment',
        })
      },
    })
    actions.push({
      emoji: '🏆',
      label: 'Crew Rankings',
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          author: user,
          commandTag: 'rankings',
        })
      },
    })
    actions.push({
      emoji: '🧾',
      label: 'Ship Log',
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          author: user,
          commandTag: 'log',
        })
      },
    })

    return {
      fields,
      actions,
    }
  }

  guild.ship.equipmentInfo = () => {
    const fields = [],
      actions = []

    let index = 1
    Object.keys(guild.ship.equipment)
      .sort((a, b) => a - b)
      .forEach((eqType) => {
        guild.ship.equipment[eqType]
          .sort((a, b) => a.displayName - b.displayName)
          .forEach((e) => {
            actions.push({
              emoji: numberToEmoji(index),
              label: `${e.emoji} \`${e.displayName}\` (${capitalize(eqType)})`,
              action: async ({ user, msg }) => {
                await runGuildCommand({
                  msg,
                  author: user,
                  commandTag: 'equipment',
                  props: { equipment: e },
                })
              },
            })
            index++
          })
      })

    return { fields, actions }
  }
}
