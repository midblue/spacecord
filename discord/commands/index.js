const send = require(`../actions/send`)
const { username, applyCustomParams } = require(`../botcommon`)
const defaultServerSettings = require(`../defaults/defaultServerSettings`)
const db = require(`../../db/db`)

// * get all commands from files in this folder
const fs = require(`fs`)
const commands = []
fs.readdir(`./discord/commands`, (err, files) => {
  files.forEach((file) => {
    if (
      !file.endsWith(`.js`) ||
      file === `index.js` ||
      (!process.env.DEV && file.startsWith(`debug`))
    ) { return }
    commands.push(require(`./${file}`))
  })
  // console.log(`Loaded ${commands.length} commands`)
})

module.exports = {
  test: async ({ msg, client, predeterminedCommandTag, props }) => {
    const settings = defaultServerSettings // todo link to real settings eventually
    const game = client.game
    const author = msg.author

    for (const command of commands) {
      // * run test to see if command triggers
      const match =
        predeterminedCommandTag === command.tag ||
        (!predeterminedCommandTag &&
          command.test &&
          (await command.test(msg.content, settings)))

      if (match) {
        if (command.gameAdminsOnly) {
          if (
            ![`244651135984467968`, `395634705120100367`].includes(
              msg.author.id
            )
          ) { return }
        }

        let authorIsAdmin = false
        if (msg.guild && command.admin) {
          const member = await msg.guild.members.fetch(msg.author.id)
          if (member)
            msg.author = member
          authorIsAdmin = member.permissions.has(`BAN_MEMBERS`)
          if (!authorIsAdmin) { return send(msg, `That command is only available to server admins.`) }
        }

        let authorIsCaptain = false
        let ship, guild
        if (!command.noShip) {
          const res = await game.guild(msg.guild?.id || msg.channel?.guild?.id)
          if (!res.ok && !command.public)
            return send(msg, res.message)
          guild = res.guild
          ship = guild?.ship
          if (ship.status.dead && !command.gameAdminsOnly) {
            return send(
              msg,
              `Your ship has been destroyed! Please pause for a moment of silence until your captain gathers the courage to start again.`
            )
          }
          const captain = ship && ship.captain
          if (captain)
            authorIsCaptain = msg.author.id === captain
        }

        const authorCrewMemberObject =
          msg.guild && ship && ship.members.find((m) => m.id === msg.author.id)
        if (!command.public && !authorCrewMemberObject) {
          return send(
            msg,
            `That command is only available to crew members. Use \`${settings.prefix}join\` to join the crew!`
          )
        }

        if (
          command.captain &&
          !authorIsAdmin &&
          ship?.captain &&
          msg.author.id !== ship.captain
        ) {
          return send(
            msg,
            await applyCustomParams(
              msg,
              `That command is only available to the ship's captain, %username%${ship.captain}%.`
            )
          )
        }

        let requirements
        if (command.equipmentType) {
          const requirementsResponse = ship.getRequirements(
            command.equipmentType,
            settings,
            authorCrewMemberObject
          )
          if (!requirementsResponse.ok) { return send(msg, requirementsResponse.message) }
          requirements = requirementsResponse.requirements
        }

        author.nickname = await username(msg, author.id)

        // in case the server changes their name, update it here
        if (guild && msg.guild && msg.guild.name !== guild.guildName) {
          guild.guildName = msg.guild.name
          db.guild.update({
            guildId: msg.guild.id,
            updates: { guildName: msg.guild.name }
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
          authorIsCaptain,
          authorCrewMemberObject,
          requirements,
          author,
          client,
          game,
          ...props
        })
      }
    }
  },
  commands
}
