const runGuildCommand = require('../../../../discord/actions/runGuildCommand')

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

    actions.push({
      emoji: '📡',
      label: 'Scan Area',
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
        label: 'Direction Vote',
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
        label: 'Speed Vote',
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

    actions.push({
      emoji: '🏃‍♀️',
      label: 'Generate Power',
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
