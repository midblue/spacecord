const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js')

module.exports = {
  tag: 'log',
  documentation: {
    name: `log`,
    value: `Consult the ship's log of events`,
    emoji: '🧾',
    priority: 50,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:log|journal|shiplog)$`, 'gi').exec(
      content,
    )
  },
  async action({ msg, settings, client, ship }) {
    log(msg, 'Log', msg.guild.name)
    const res = ship.getLog(10)
    return send(msg, res.message)
  },
}
