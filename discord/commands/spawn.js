const send = require('../actions/send')
const { logCommand } = require('../common')

module.exports = {
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:spawn)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game }) {
    logCommand(msg, 'Spawn', msg.author.username)
    const guild = game.spawn(msg.guild)
    send(msg, '```' + JSON.stringify(guild, null, 2) + '```')
  },
}
