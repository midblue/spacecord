const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const { game } = require(`../../game/manager`)

module.exports = {
  tag: `debug`,
  documentation: false,
  gameAdminsOnly: true,
  public: true,
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}d(?: ([^ ]*))?(?: (.*))?$`,
      `gi`,
    ).exec(content)
  },
  async action({ msg, match, settings, client, ship }) {
    log(msg, `Debug: ` + match[1], msg.guild.name)

    const debugCommands = {
      game: {
        description: `game`,
        action: async () => {
          const data = {
            gameDiameter: game.gameDiameter(),
            guilds: game.guilds.length,
            planets: game.planets.length,
            caches: game.caches.length,
            startTime: game.startTime,
            lastTick: game.lastTick,
          }
          return JSON.stringify(data, null, 2)
        },
      },
      this: {
        description: `this`,
        action: async () => {
          const { guild, ok } = await client.game.guild(msg.guild.id)
          if (!ok) return `no guild with id ` + id
          return JSON.stringify(guild.saveableData(), null, 2)
        },
      },
      tick: {
        description: `tick`,
        action: async () => {
          client.game.tick()
          return `ticked`
        },
      },
      guild: {
        description: `guild <id>`,
        action: async (id) => {
          if (id === `this`) id = msg.guild.id
          const { guild, ok } = await client.game.guild(id)
          if (!ok) return `no guild with id ` + id
          return JSON.stringify(guild.saveableData(), null, 2)
        },
      },
      guilds: {
        description: `guilds`,
        action: async () => {
          const res = (await client.game.guilds())
            .map((g) => g.name + `: ` + g.id)
            .sort((a, b) => b - a)
            .join(`\n`)
          return `\n` + res
        },
      },
      delete: {
        description: `delete <id>`,
        action: async (id) => {
          if (id === `this`) id = msg.guild.id
          const res = await client.game.removeGuild(id)
          return res
        },
      },
      move: {
        description: `move <guild id> <x>,<y>`,
        action: async (str) => {
          let [unused, id, x, y] = /^ ?([^ ]+) ([^ ,]+), ?([^ ,]+)$/.exec(
            str.replace(/\[\]/g, ``),
          )
          if (id === `this`) id = msg.guild.id
          const { guild } = await client.game.guild(id)
          if (!guild) return `no guild found for ` + id
          try {
            x = parseFloat(x)
            y = parseFloat(y)
          } catch (e) {
            return `invalid coords: ` + x + ` ` + y
          }
          const res = await guild.ship.move(false, [x, y])
          if (res.message) guild.pushToGuild(res.message)
          return `moved ship.`
        },
      },
      power: {
        description: `power <id> <power>`,
        action: async (str) => {
          let [unused, id, power] = /^([^ ]+) (.*)$/.exec(str)
          if (id === `this`) id = msg.guild.id
          const { guild } = await client.game.guild(id)
          if (!guild) return `no guild found for ` + id
          try {
            power = parseFloat(power)
          } catch (e) {
            return `invalid power: ` + power
          }
          guild.ship.power = power
          return `set power to ` + power
        },
      },
      credits: {
        description: `credits <id> <credits>`,
        action: async (str) => {
          let [unused, id, credits] = /^([^ ]+) (.*)$/.exec(str)
          if (id === `this`) id = msg.guild.id
          const { guild } = await client.game.guild(id)
          if (!guild) return `no guild found for ` + id
          try {
            credits = parseInt(credits)
          } catch (e) {
            return `invalid credits: ` + credits
          }
          guild.ship.credits = credits
          return `set credits to ` + credits
        },
      },
      cargo: {
        description: `cargo <id> <type> <amount>`,
        action: async (str) => {
          let [unused, id, type, amount] = /^([^ ]+) ([^ ]*) ([^ ]*)$/.exec(str)
          if (id === `this`) id = msg.guild.id
          const { guild } = await client.game.guild(id)
          if (!guild) return `no guild found for ` + id
          try {
            amount = parseFloat(amount)
          } catch (e) {
            return `invalid amount: ` + amount
          }
          const existingCargo = guild.ship.cargo.find((c) => c.type === type)
          if (existingCargo) existingCargo.amount = amount
          else guild.ship.cargo.push({ type, amount })
          return `set ` + type + ` amount to ` + amount
        },
      },
      togglestatus: {
        description: `togglestatus <id> <statustype>`,
        action: async (str) => {
          let [unused, id, type] = /^([^ ]+) ([^ ]*)$/.exec(str)
          if (id === `this`) id = msg.guild.id
          const { guild } = await client.game.guild(id)
          if (!guild) return `no guild found for ` + id
          const currStatus = guild.ship.status
          const newStatus = !currStatus[type]
          currStatus[type] = newStatus
          return `set ` + type + ` to ` + newStatus
        },
      },
      stamina: {
        description: `stamina`,
        action: async () => {
          const { guild, ok } = await client.game.guild(msg.guild.id)
          if (!ok) return `no guild with id ` + id
          const member = guild.ship.members.find((m) => m.id === msg.author.id)
          if (!member) return `no member with id ` + msg.author.id
          member.stamina = 10
          return `refilled your stamina`
        },
      },
      setstamina: {
        description: `setstamina <user id> <amount>`,
        action: async (str) => {
          let [unused, id, amount] = /^([^ ]+) ([^ ]*)$/.exec(str)
          if (id === `me`) id = msg.author.id
          try {
            amount = parseFloat(amount)
          } catch (e) {
            return `invalid amount: ` + amount
          }
          const member = (
            await client.game.guild(msg.guild.id)
          ).guild.ship.members.find((m) => m.id === msg.author.id)
          if (!member) return `no member with id ` + msg.author.id
          member.stamina = amount / member.maxStamina()
          return `set stamina to ` + amount
        },
      },
      kill: {
        description: `kill <id>`,
        action: async (str) => {
          let [unused, id] = /^([^ ]+)$/.exec(str)
          if (id === `this`) id = msg.guild.id
          const { guild } = await client.game.guild(id)
          if (!guild) return `no guild found for ` + id
          guild.ship.takeDamage({
            damage: 99999999,
            attacker: { name: `God`, location: [0, 0] },
            weapon: {
              displayName: `Banhammer`,
              emoji: `🔨`,
            },
            attackDistance: 999999,
            advantageDamageMultiplier: 999999,
            advantageAccuracyMultiplier: 999999,
          })
          return `killed ` + id
        },
      },
    }

    let message =
      `Available commands:\n` +
      Object.values(debugCommands)
        .map((c) => settings.prefix + `d ` + c.description)
        .join(`\n`)

    if (match[1]) {
      const debugCommand = match[1]
      if (debugCommands[debugCommand]) {
        try {
          message = await debugCommands[debugCommand].action(match[2])
          if (message.message) message = message.message
        } catch (e) {
          console.log(`debug error:`, e)
        }
      }
    }
    return send(msg, `Debug: ` + message)
  },
}
