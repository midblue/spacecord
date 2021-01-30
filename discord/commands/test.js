const send = require('../actions/send')
const { log } = require('../botcommon')

module.exports = {
  tag: 'test',
  public: true,
  noShip: true,
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:test)$`, 'gi').exec(content)
  },
  async action({ msg, settings }) {
    log(msg, 'Test', 'message')
    send(msg, `Hiya!`)
  },
}
