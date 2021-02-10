const {
  capitalize,
  bearingToDegrees,
  bearingToArrow,
  percentToTextBars,
} = require('../../../../common')
const runGuildCommand = require('../../../../discord/actions/runGuildCommand')

module.exports = (guild) => {
  guild.ship.statusReport = async () => {
    const fields = [],
      actions = await guild.ship.getAvailableActions()

    const fuel = guild.ship.cargo.find((c) => c.type === 'fuel').amount

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
        ` (${Math.round((guild.ship.power / guild.ship.maxPower()) * 100)}%)`,
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
      name: `🚀 Model`,
      value: guild.ship.displayName,
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
      name: `👩‍🏭👷🧑‍✈️ Crew`,
      value: guild.ship.members.length + ' members',
    })

    if (guild.faction)
      fields.push({
        name: `🚩 Faction`,
        value: guild.faction.emoji + guild.faction.name,
      })

    Object.keys(guild.ship.equipment).forEach((eqType) => {
      fields.push({
        name: capitalize(eqType),
        inline: false,
        value: guild.ship.equipment[eqType]
          .map(
            (e) =>
              `${e.emoji} \`${e.displayName}\` (${(e.repair * 100).toFixed(
                0,
              )}% repair)`,
          )
          .join('\n'),
      })
    })

    actions.push({
      emoji: '🔧',
      label: 'Repair',
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          author: user,
          commandTag: 'repair',
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
}
