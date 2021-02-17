const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js-light')

module.exports = {
  tag: 'map',
  documentation: {
    name: 'map',
    value: 'The ship\'s map of its discoveries.',
    emoji: '🗺',
    category: 'ship',
    priority: 40
  },
  test (content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:map|viewmap|seemap|lookatmap)$`,
      'gi'
    ).exec(content)
  },
  async action ({ msg, settings, client, ship }) {
    log(msg, 'Map', msg.guild.name)
    // todo
    const res = ship.getMap()
    return send(msg, res.message)
  }
}
