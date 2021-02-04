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
      this: {
        description: 'this',
        action: async () => {
          const { guild, ok } = await client.game.guild(msg.guild.id)
          if (!ok) return 'no guild with id ' + id
          return JSON.stringify(guild.saveableData(), null, 2)
        },
      },
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
          if (id === 'this') id = msg.guild.id
          const { guild, ok } = await client.game.guild(id)
          if (!ok) return 'no guild with id ' + id
          return JSON.stringify(guild.saveableData(), null, 2)
        },
      },
      guilds: {
        description: 'guilds',
        action: async () => {
          const res = (await client.game.guilds())
            .map((g) => g.guildName + ': ' + g.guildId)
            .sort((a, b) => b - a)
            .join('\n')
          return '\n' + res
        },
      },
      deleteguild: {
        description: 'deleteguild <id>',
        action: async (id) => {
          if (id === 'this') id = msg.guild.id
          const res = await client.game.removeGuild(id)
          return res
        },
      },
      moveship: {
        description: 'moveship <guild id> <x>,<y>',
        action: async (str) => {
          let [unused, id, x, y] = /^ ?([^ ]+) ([^ ,]+), ?([^ ,]+)$/.exec(
            str.replace(/\[\]/g, ''),
          )
          if (id === 'this') id = msg.guild.id
          const { guild } = await client.game.guild(id)
          if (!guild) return 'no guild found for ' + id
          try {
            x = parseFloat(x)
            y = parseFloat(y)
          } catch (e) {
            return 'invalid coords: ' + x + ' ' + y
          }
          await guild.ship.move(false, [x, y])
          return 'moved ship.'
        },
      },
      setpower: {
        description: 'setpower <id> <power>',
        action: async (str) => {
          let [unused, id, power] = /^([^ ]+) (.*)$/.exec(str)
          if (id === 'this') id = msg.guild.id
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
      cargo: {
        description: 'cargo <id> <type> <amount>',
        action: async (str) => {
          let [unused, id, type, amount] = /^([^ ]+) ([^ ]*) ([^ ]*)$/.exec(str)
          if (id === 'this') id = msg.guild.id
          const { guild } = await client.game.guild(id)
          if (!guild) return 'no guild found for ' + id
          try {
            amount = parseFloat(amount)
          } catch (e) {
            return 'invalid amount: ' + amount
          }
          const existingCargo = guild.ship.cargo.find((c) => c.type === type)
          if (existingCargo) existingCargo.amount = amount
          else guild.ship.cargo.push({ type, amount })
          return 'set ' + type + ' amount to ' + amount
        },
      },
      togglestatus: {
        description: 'togglestatus <id> <statustype>',
        action: async (str) => {
          let [unused, id, type] = /^([^ ]+) ([^ ]*)$/.exec(str)
          if (id === 'this') id = msg.guild.id
          const { guild } = await client.game.guild(id)
          if (!guild) return 'no guild found for ' + id
          const currStatus = guild.ship.status
          const newStatus = !currStatus[type] ? true : false
          currStatus[type] = newStatus
          return 'set ' + type + ' to ' + newStatus
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
