const send = require('../actions/send')
const { log } = require('../botcommon')

module.exports = {
  tag: 'shipInfo',
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:shipinfo)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game, client, ship }) {
    log(msg, 'Ship Info', msg.guild.name)
    // age, model, upgrades, slots, image, etc
  },
}
