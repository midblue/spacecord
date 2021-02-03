const runGuildCommand = require('../../../../discord/actions/runGuildCommand')

module.exports = (guild) => {
  guild.ship.getAvailableActions = () => {
    const availableActions = []

    // if (guild.status.landed)
    //   availableActions.push({
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
    //   availableActions.push({
    //     emoji: '🪐',
    //     label: 'Land On Planet',
    //     requirements: {
    //       piloting: 4,
    //     },
    //     action({ user, msg }) {
    //       console.log('Land On Planet')
    //     },
    //   })

    // availableActions.push({
    //   emoji: '🎛',
    //   label: 'Ship Controls',
    //   action({ user, msg }) {
    //     console.log('Ship Controls')
    //   },
    // })

    availableActions.push({
      emoji: '📡',
      label: 'Scan Area',
      requirements: {
        engineering: 2,
      },
      async action({ user, msg }) {
        await runGuildCommand({
          guildId: guild.guildId,
          channelId: guild.channel,
          msg,
          author: user,
          commandTag: 'scanArea',
        })
      },
    })

    availableActions.push({
      emoji: '🏃‍♀️',
      label: 'Run on Treadmill',
      async action({ user, msg }) {
        await runGuildCommand({
          guildId: guild.guildId,
          channelId: guild.channel,
          commandTag: 'generatePower',
          author: user,
          msg,
          props: { exerciseType: 'Treadmill' },
        })
      },
    })

    return availableActions
  }
}
