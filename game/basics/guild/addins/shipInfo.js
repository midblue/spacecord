const { capitalize } = require('../../../../common')
const runGuildCommand = require('../../../../discord/actions/runGuildCommand')

module.exports = (guild) => {
  guild.ship.shipInfo = () => {
    const fields = [],
      actions = []

    fields.push({
      name: `🚀 Model`,
      value: guild.ship.modelDisplayName,
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

    Object.keys(guild.ship.equipment).forEach((eqType) => {
      fields.push({
        name: capitalize(eqType),
        inline: false,
        value: guild.ship.equipment[eqType]
          .map(
            (e) =>
              `${e.emoji} \`${e.modelDisplayName}\` (${(e.repair * 100).toFixed(
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

    return {
      fields,
      actions,
    }
  }
}
