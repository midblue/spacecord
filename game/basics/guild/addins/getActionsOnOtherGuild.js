const runGuildCommand = require('../../../../discord/actions/runGuildCommand')

module.exports = (guild) => {
  guild.ship.getActionsOnOtherGuild = () => {
    const actions = []

    actions.push({
      emoji: '🔍',
      label: 'Scan Ship',
      async action({ user, msg, guild, otherGuild }) {
        await runGuildCommand({
          commandTag: 'scanShip',
          author: user,
          msg,
          props: { otherGuild, guild },
        })
      },
    })

    return actions
  }
}
