const runGuildCommand = require('../../../../discord/actions/runGuildCommand')
const { msToTimeString, usageTag } = require('../../../../common')
const { power } = require('../../story/story')

module.exports = (guild) => {
  guild.ship.getAvailableActions = () => {
    const actions = []

    // if (guild.status.landed)
    //   actions.push({
    //     emoji: '🚀',
    //     label: 'Take Off',
    //     requirements: {
    //       piloting: 2,
    //     },
    //     action({ user, msg }) {
    //       console.log('Take Off')
    //     },
    //   })

    // const landablePlanets = false
    // if (landablePlanets)
    //   actions.push({
    //     emoji: '🪐',
    //     label: 'Land On Planet',
    //     requirements: {
    //       piloting: 4,
    //     },
    //     action({ user, msg }) {
    //       console.log('Land On Planet')
    //     },
    //   })

    // actions.push({
    //   emoji: '🎛',
    //   label: 'Ship Controls',
    //   action({ user, msg }) {
    //     console.log('Ship Controls')
    //   },
    // })

    const interactableGuilds = guild.context.scanArea({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range: guild.ship.maxActionRadius(),
      excludeIds: guild.guildId,
    }).guilds
    if (interactableGuilds && interactableGuilds.length)
      actions.push({
        emoji: '🛸',
        label: 'See Nearby Ships',
        async action({ user, msg }) {
          await runGuildCommand({
            msg,
            author: user,
            commandTag: 'nearbyShips',
            props: { interactableGuilds },
          })
        },
      })

    actions.push({
      emoji: '📡',
      label:
        'Scan Area ' +
        usageTag(guild.ship.equipment.telemetry[0].powerUse, 'scan'),
      requirements: {
        engineering: 2,
      },
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          author: user,
          commandTag: 'scanArea',
        })
      },
    })

    if (guild.ship.status.flying) {
      actions.push({
        emoji: '🧭',
        label: 'Start Direction Vote ' + usageTag(null, 'poll'),
        async action({ user, msg }) {
          await runGuildCommand({
            msg,
            author: user,
            commandTag: 'direction',
          })
        },
      })
      actions.push({
        emoji: '⏩',
        label: 'Start Speed Vote ' + usageTag(null, 'poll'),
        async action({ user, msg }) {
          await runGuildCommand({
            msg,
            author: user,
            commandTag: 'speed',
          })
        },
      })
    }

    actions.push({
      emoji: '🏃‍♀️',
      label: 'Generate Power ' + usageTag(null, 'generatePower'),
      async action({ user, msg }) {
        await runGuildCommand({
          commandTag: 'generatePower',
          author: user,
          msg,
          props: { exerciseType: 'Treadmill' },
        })
      },
    })

    actions.push({
      emoji: '📊',
      label: 'Ship Info',
      async action({ user, msg }) {
        await runGuildCommand({
          commandTag: 'shipInfo',
          author: user,
          msg,
        })
      },
    })

    return actions
  }
}
