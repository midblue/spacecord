const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js')
// const db = require('../../db/db')

module.exports = {
  tag: 'debug',
  documentation: false,
  gameAdminsOnly: true,
  test(content, settings) {
    return new RegExp(`^${settings.prefix}d(?: ([^ ]*) (.*))?$`, 'gi').exec(
      content,
    )
  },
  async action({ msg, match, settings, client, ship }) {
    log(msg, 'Debug: ' + match[1], msg.guild.name)

    const debugCommands = {
      deleteguild: {
        description: 'deleteguild <id>',
        action: async (id) => {
          const res = await client.game.removeGuild(id)
          return res
        },
      },
      moveguildshipto: {
        description: 'moveguildshipto <id> <x>,<y>',
        action: async (str) => {
          let [unused, id, x, y] = /^ ?(\d+) ([^ ,]+), ?([^ ,]+) ?$/.exec(
            str.replace(/\[\]/g, ''),
          )
          const { guild } = await client.game.guild(id)
          if (!guild) return 'no guild found for ' + id
          try {
            x = parseFloat(x)
            y = parseFloat(y)
          } catch (e) {
            return 'invalid coords: ' + x + ' ' + y
          }
          const res = await guild.ship.move(false, [x, y])
          return 'moved ship.'
        },
      },
    }

    let message =
      'Available commands:\n' +
      Object.values(debugCommands)
        .map((c) => c.description)
        .join('\n')

    if (match[1]) {
      const debugCommand = match[1]
      if (debugCommands[debugCommand])
        try {
          message = await debugCommands[debugCommand].action(match[2])
          if (message.message) message = message.message
        } catch (e) {
          console.log('debug error:', e)
        }
    }
    return send(msg, 'Debug: ' + message)
  },
}
