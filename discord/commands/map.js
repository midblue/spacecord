const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js-light')

module.exports = {
  tag: 'map',
  documentation: {
    name: `map`,
    value: `The ship's map of its discoveries.`,
    emoji: '🗺',
    priority: 40,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:map|viewmap|seemap|lookatmap)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, settings, client, ship }) {
    log(msg, 'Map', msg.guild.name)
    // todo
    // const res = ship.getMap()
    // return send(msg, res.message)
    send(
      msg,
      `All you have is a sketch that the captain drew on the back of a napkin. It doesn't look like much of anything, as far as you can tell.`,
    )
  },
}
