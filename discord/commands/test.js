const send = require('../actions/send')
const { log } = require('../common')

module.exports = {
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:test)$`, 'gi').exec(content)
  },
  async action({ msg, settings }) {
    log(msg, 'Test', 'message')
    send(msg, `Hiya!`)
  },
}
