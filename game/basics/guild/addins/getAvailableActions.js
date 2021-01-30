const runGuildCommand = require('../../../../discord/actions/runGuildCommand')

module.exports = (guild) => {
  guild.ship.getAvailableActions = () => {
    const availableActions = []

    if (guild.status === 'landed')
      availableActions.push({
        emoji: '🚀',
        label: 'Take Off',
        skillRequirement: [
          {
            skill: 'piloting',
            requirement: 2,
          },
        ],
        action() {
          console.log('Take Off')
        },
      })

    const landablePlanets = false
    if (landablePlanets)
      availableActions.push({
        emoji: '🪐',
        label: 'Land On Planet',
        skillRequirement: [
          {
            skill: 'piloting',
            requirement: 4,
          },
        ],
        action() {
          console.log('Land On Planet')
        },
      })

    availableActions.push({
      emoji: '🎛',
      label: 'Ship Controls',
      action() {
        console.log('Ship Controls')
      },
    })

    availableActions.push({
      emoji: '📡',
      label: 'Scan Area',
      skillRequirement: [
        {
          skill: 'engineering',
          requirement: 2,
        },
      ],
      async action() {
        await runGuildCommand({
          guildId: guild.guildId,
          channelId: guild.channel,
          commandTag: 'scanArea',
        })
      },
    })

    availableActions.push({
      emoji: '🏃‍♀️',
      label: 'Run on Treadmill',
      async action() {
        await runGuildCommand({
          guildId: guild.guildId,
          channelId: guild.channel,
          commandTag: 'generatePower',
          props: { type: 'Treadmill' },
        })
      },
    })

    return availableActions
  }
}
