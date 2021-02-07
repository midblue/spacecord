const runGuildCommand = require('../../../../discord/actions/runGuildCommand')

module.exports = (guild) => {
  guild.ship.getActionsOnOtherShip = (otherShip) => {
    const actions = []

    actions.push({
      emoji: '🔍',
      label: 'Scan Ship',
      async action({ user, msg, guild }) {
        await runGuildCommand({
          commandTag: 'scanShip',
          author: user,
          msg,
          props: { otherShip, guild },
        })
      },
    })

    actions.push({
      emoji: '⚔️',
      label: 'Attack!',
      async action({ user, msg, guild }) {
        await runGuildCommand({
          commandTag: 'attackShip',
          author: user,
          msg,
          props: { otherShip, guild },
        })
      },
    })

    return actions
  }
}
