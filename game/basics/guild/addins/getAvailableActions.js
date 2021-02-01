const runGuildCommand = require('../../../../discord/actions/runGuildCommand')

module.exports = (guild) => {
  guild.ship.getAvailableActions = () => {
    const availableActions = []

    if (guild.status === 'landed')
      availableActions.push({
        emoji: '🚀',
        label: 'Take Off',
        requirements: {
          piloting: 2,
        },
        action({ user }) {
          console.log('Take Off')
        },
      })

    const landablePlanets = false
    if (landablePlanets)
      availableActions.push({
        emoji: '🪐',
        label: 'Land On Planet',
        requirements: {
          piloting: 4,
        },
        action({ user }) {
          console.log('Land On Planet')
        },
      })

    availableActions.push({
      emoji: '🎛',
      label: 'Ship Controls',
      action({ user }) {
        console.log('Ship Controls')
      },
    })

    availableActions.push({
      emoji: '📡',
      label: 'Scan Area',
      requirements: {
        engineering: 2,
      },
      async action({ user }) {
        await runGuildCommand({
          guildId: guild.guildId,
          channelId: guild.channel,
          author: user,
          commandTag: 'scanArea',
        })
      },
    })

    availableActions.push({
      emoji: '🏃‍♀️',
      label: 'Run on Treadmill',
      async action({ user }) {
        await runGuildCommand({
          guildId: guild.guildId,
          channelId: guild.channel,
          commandTag: 'generatePower',
          author: user,
          props: { exerciseType: 'Treadmill' },
        })
      },
    })

    return availableActions
  }
}
