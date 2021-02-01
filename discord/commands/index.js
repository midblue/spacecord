const send = require('../actions/send')
const { username } = require('../botcommon')
const defaultServerSettings = require('../defaults/defaultServerSettings')

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
  console.log(`Loaded ${commands.length} commands`)
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
        const authorIsAdmin =
          msg.guild &&
          msg.guild.member(msg.author) &&
          msg.guild.member(msg.author).permissions.has('BAN_MEMBERS')
        if (command.admin && !authorIsAdmin)
          return send(msg, `That command is only available to server admins.`)

        let ship, guild
        if (!command.noShip) {
          guild = await game.guild(msg.guild.id)
          if (!guild.ok) return send(msg, guild.message)
          ship = guild.ship
        }

        const authorCrewMemberObject =
          msg.guild && ship && ship.members.find((m) => m.id === msg.author.id)
        if (!command.public && !authorCrewMemberObject)
          return send(
            msg,
            `That command is only available to crew members. Use \`${settings.prefix}join\` to join the crew!`,
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
