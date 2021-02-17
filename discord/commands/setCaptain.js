const send = require('../actions/send')
const { log } = require('../botcommon')

module.exports = {
  tag: 'setCaptain',
  captain: true,
  documentation: {
    name: 'setcaptain <user id>',
    value: 'Sets a new captain for the ship.',
    emoji: '👩‍✈️',
    priority: 80
  },
  test (content, settings) {
    return new RegExp(`^${settings.prefix}(?:setcaptain) (.*)$`, 'gi').exec(
      content
    )
  },
  async action ({ msg, match, settings, client, guild }) {
    log(msg, 'Set Captain', msg.channel.name)
    let id = match[1]
    id = parseInt(id)
    const res = await guild.ship.setCaptain(id)
    return send(msg, res.message)
  }
}
