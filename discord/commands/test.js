const send = require('../actions/send')
const { logCommand } = require('../common')

module.exports = {
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:test)$`, 'gi').exec(content)
  },
  async action({ msg, settings }) {
    logCommand(msg, 'Test', msg.author.username)
    send(msg, `Hiya!`)
  },
}
