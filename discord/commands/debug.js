const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js')
const { guild } = require('../../game/manager')
// const db = require('../../db/db')

module.exports = {
  tag: 'debug',
  documentation: false,
  gameAdminsOnly: true,
  public: true,
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}d(?: ([^ ]*))?(?: (.*))?$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, match, settings, client, ship }) {
    log(msg, 'Debug: ' + match[1], msg.guild.name)

    const debugCommands = {
      tick: {
        description: 'tick',
        action: async () => {
          client.game.tick()
          return 'ticked'
        },
      },
      guild: {
        description: 'guild <id>',
        action: async (id) => {
          const { guild, ok } = await client.game.guild(id)
          if (!ok) return 'no guild with id ' + id
          return JSON.stringify(guild.saveableData(), null, 2)
        },
      },
      listguilds: {
        description: 'listguilds',
        action: async () => {
          const res = (await client.game.guilds())
            .map((g) => g.guildName + ': ' + g.guildId)
            .join('\n')
          return '\n' + res
        },
      },
      deleteguild: {
        description: 'deleteguild <id>',
        action: async (id) => {
          const res = await client.game.removeGuild(id)
          return res
        },
      },
      moveship: {
        description: 'moveship <guild id> <x>,<y>',
        action: async (str) => {
          let [unused, id, x, y] = /^ ?(\d+) ([^ ,]+), ?([^ ,]+)$/.exec(
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
      setpower: {
        description: 'setpower <id> <power>',
        action: async (str) => {
          let [unused, id, power] = /^(\d+) (.*)$/.exec(str)
          const { guild } = await client.game.guild(id)
          if (!guild) return 'no guild found for ' + id
          try {
            power = parseFloat(power)
          } catch (e) {
            return 'invalid power: ' + power
          }
          guild.ship.power = power
          return 'set power to ' + power
        },
      },
    }

    let message =
      'Available commands:\n' +
      Object.values(debugCommands)
        .map((c) => settings.prefix + 'd ' + c.description)
        .join('\n')

    if (match[1]) {
      const debugCommand = match[1]
      if (debugCommands[debugCommand]) {
        try {
          message = await debugCommands[debugCommand].action(match[2])
          if (message.message) message = message.message
        } catch (e) {
          console.log('debug error:', e)
        }
      }
    }
    return send(msg, 'Debug: ' + message)
  },
}
