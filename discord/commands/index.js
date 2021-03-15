const send = require(`../actions/send`)
const { username, applyCustomParams, canEdit } = require(`../botcommon`)
const defaultServerSettings = require(`../defaults/defaultServerSettings`)

// * get all commands from files in this folder
const fs = require(`fs`)
const commands = []
fs.readdir(`./discord/commands`, (err, files) => {
  files.forEach((file) => {
    if (
      !file.endsWith(`.js`) ||
      file === `index.js` ||
      (!process.env.DEV && file.startsWith(`debug`))
    ) {
      return
    }
    commands.push(require(`./${file}`))
  })
  // console.log(`Loaded ${commands.length} commands`)
})

module.exports = {
  test: async ({ msg, client, predeterminedCommandTag, props }) => {
    const settings = defaultServerSettings // todo link to real settings eventually
    const game = client.game
    const pm = !msg.channel || msg.channel.type === `dm`

    for (const command of commands) {
      // * run test to see if command triggers
      const match =
        predeterminedCommandTag === command.tag ||
        (!predeterminedCommandTag &&
          command.test &&
          (await command.test(msg.content, settings)))

      if (match) {
        let authorIsCaptain = false
        let authorIsAdmin = false
        let authorIsGameAdmin = false
        let requirements
        let guild, ship

        msg.pm = pm

        if (
          [`244651135984467968`, `395634705120100367`].includes(msg.author?.id)
        ) {
          authorIsAdmin = true
          authorIsGameAdmin = true
        }
        if (command.gameAdminsOnly && !authorIsGameAdmin)
          if (pm && !command.pm && !command.pmOnly)
            return send(
              msg,
              `That command cannot be run via private messages. Trying using it in your ship's server!`,
            )

        if (pm && (!command.public || command.tag === `debug`)) {
          const currentGuildId = (
            (await client.game.db.user.get({
              id: msg.author.id,
            })) || {}
          ).activeGuild
          if (!currentGuildId)
            return send(
              msg,
              `You need to join a server's ship before you can run that command. Use \`.join\` in a server with the game to join their crew.`,
            )
          const foundDiscordGuild = (await game.guild(currentGuildId)).guild
          if (!foundDiscordGuild)
            return send(
              msg,
              `You need to join a server's ship before you can run that command. Use \`.join\` in a server with the game to join their crew.`,
            )
          guild = foundDiscordGuild
          ship = foundDiscordGuild?.ship
        }

        if (msg.guild && command.admin && !authorIsGameAdmin) {
          const member = await msg.guild.members.fetch(msg.author.id)
          if (member) msg.author = member
          authorIsAdmin = member.permissions.has(`BAN_MEMBERS`)
          if (!authorIsAdmin) {
            return send(msg, `That command is only available to server admins.`)
          }
        }

        if (!command.noShip && !guild) {
          const res = await game.guild(msg.guild?.id || msg.channel?.guild?.id)
          if (!res.ok && !command.public) return send(msg, res.message)
          guild = res.guild
          ship = guild?.ship
        }
        if (!command.noShip) {
          if (
            guild?.ship &&
            guild.ship.status.dead &&
            !command.gameAdminsOnly
          ) {
            return send(
              msg,
              `Your ship has been destroyed! Please pause for a moment of silence until your captain gathers the courage to start again.`,
            )
          }
          const captain = guild?.ship && guild?.ship?.captain
          if (captain) authorIsCaptain = msg.author.id === captain
        }

        const authorCrewMemberObject =
          guild?.ship &&
          guild.ship?.members?.find((m) => m.id === msg.author.id)
        if (!command.public && !authorCrewMemberObject) {
          return send(
            msg,
            `That command is only available to crew members. Use \`${settings.prefix}join\` to join the crew!`,
          )
        }
        if (msg.author) msg.author.crewMemberObject = authorCrewMemberObject

        if (
          command.captain &&
          !authorIsAdmin &&
          guild.ship?.captain &&
          msg.author.id !== ship.captain
        ) {
          return send(
            msg,
            await applyCustomParams(
              msg,
              `That command is only available to the ship's captain, %username%${ship.captain}%.`,
            ),
          )
        }

        if (command.equipmentType) {
          // todo unneeded? modifiable?
          const requirementsResponse = guild.ship.getRequirements(
            command.equipmentType,
            settings,
            authorCrewMemberObject,
          )
          if (!requirementsResponse.ok) {
            return send(msg, requirementsResponse.message)
          }
          requirements = requirementsResponse.requirements
        }

        if (msg.author)
          msg.author.nickname = await username(
            msg,
            msg.author.id,
            guild?.id,
            client,
          )

        // in case the server changes their name, update it here
        if (guild && msg.guild && msg.guild.name !== guild.name) {
          guild.name = msg.guild.name
          client.game.db.guild.update({
            id: msg.guild.id,
            updates: { name: msg.guild.name },
          })
        }

        // in case a user's active guild needs updating, update it here
        if (guild && msg.guild) {
          const memberInfo = guild.members.find(
            (m) => m.userId === msg.author.id,
          )
          const user =
            memberInfo &&
            (await client.game.db.user.get({
              id: memberInfo.userId,
            }))
          if (user && user.activeGuild !== msg.guild.id) {
            console.log(`Updating user active guild`)
            user.activeGuild = msg.guild.id
            guild.context.db.user.update({
              id: user.id,
              updates: { activeGuild: user.activeGuild },
            })
          }
        }

        if (command.pmOnly && (await canEdit(msg))) msg.delete()

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
          author: msg.author,
          client,
          game,
          canEdit,
          ...props,
        })
      }
    }
  },
  commands,
}
