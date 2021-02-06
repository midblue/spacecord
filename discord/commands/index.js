const send = require('../actions/send')
const { username, applyCustomParams } = require('../botcommon')
const defaultServerSettings = require('../defaults/defaultServerSettings')
const db = require('../../db/db')

// * get all commands from files in this folder
const fs = require('fs')
const commands = []
fs.readdir('./discord/commands', (err, files) => {
  files.forEach((file) => {
    if (
      !file.endsWith('.js') ||
      file === 'index.js' ||
      (!process.env.DEV && file.startsWith('debug'))
    )
      return
    commands.push(require(`./${file}`))
  })
  // console.log(`Loaded ${commands.length} commands`)
})

module.exports = {
  test: async ({ msg, client, predeterminedCommandTag, props }) => {
    const settings = defaultServerSettings // todo link to real settings eventually
    const game = client.game
    let author = msg.author

    for (let command of commands) {
      // * run test to see if command triggers
      const match =
        predeterminedCommandTag === command.tag ||
        (!predeterminedCommandTag &&
          (await command.test(msg.content, settings)))

      if (match) {
        if (command.gameAdminsOnly)
          if (
            !['244651135984467968', '395634705120100367'].includes(
              msg.author.id,
            )
          )
            return

        const authorIsAdmin =
          msg.guild &&
          msg.guild.member(msg.author) &&
          msg.guild.member(msg.author).permissions.has('BAN_MEMBERS')
        if (command.admin && !authorIsAdmin)
          return send(msg, `That command is only available to server admins.`)

        let ship, guild
        if (!command.noShip) {
          let res = await game.guild(msg.guild.id)
          if (!res.ok) return send(msg, res.message)
          guild = res.guild
          ship = guild.ship
        }

        const authorCrewMemberObject =
          msg.guild && ship && ship.members.find((m) => m.id === msg.author.id)
        if (!command.public && !authorCrewMemberObject)
          return send(
            msg,
            `That command is only available to crew members. Use \`${settings.prefix}join\` to join the crew!`,
          )

        if (
          command.captain &&
          !authorIsAdmin &&
          ship?.captain &&
          msg.author.id !== ship.captain
        )
          return send(
            msg,
            await applyCustomParams(
              msg,
              `That command is only available to the ship's captain, %username%${ship.captain}%.`,
            ),
          )

        let requirements
        if (command.equipmentType) {
          const requirementsResponse = ship.getRequirements(
            command.equipmentType,
            settings,
            authorCrewMemberObject,
          )
          if (!requirementsResponse.ok)
            return send(msg, requirementsResponse.message)
          requirements = requirementsResponse.requirements
        }

        author.nickname = await username(msg, author.id)

        // in case the server changes their name, update it here
        if (guild && msg.guild && msg.guild.name !== guild.guildName) {
          guild.guildName = msg.guild.name
          db.guild.update({
            guildId: msg.guild.id,
            updates: { guildName: msg.guild.name },
          })
        }

        // if (msg.delete) msg.delete()

        // * execute command
        await command.action({
          msg,
          match,
          settings,
          ship,
          guild,
          authorIsAdmin,
          authorCrewMemberObject,
          requirements,
          author,
          client,
          game,
          ...props,
        })
      }
    }
  },
  commands,
}
