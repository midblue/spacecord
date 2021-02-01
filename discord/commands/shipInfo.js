const send = require('../actions/send')
const { log } = require('../botcommon')

module.exports = {
  tag: 'shipInfo',
  documentation: {
    name: `shipinfo`,
    value: `Ship equipment, age, health, etc.`,
    emoji: '📊',
    priority: 80,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:shipinfo)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game, client, ship }) {
    log(msg, 'Ship Info', msg.guild.name)
    // age, model, upgrades, slots, image, etc
  },
}
