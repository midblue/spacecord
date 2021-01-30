const send = require('../actions/send')

// * get all commands from files in this folder
const fs = require('fs')
const commands = []
fs.readdir('./discord/commands', (err, files) => {
  files.forEach((file) => {
    if (!file.endsWith('.js') || file === 'index.js') return
    commands.push(require(`./${file}`))
  })
  // console.log(`Loaded ${commands.length} commands`)
})

module.exports = {
  test: async ({ msg, settings, client, game }) => {
    const author = msg.author
    for (let command of commands) {
      // * run test to see if command triggers
      const match = await command.test(msg.content, settings)

      if (match) {
        const authorIsAdmin =
          msg.guild &&
          msg.guild.member(msg.author) &&
          msg.guild.member(msg.author).permissions.has('BAN_MEMBERS')
        if (command.admin && !authorIsAdmin)
          return send(msg, `That command is only available to server admins.`)

        const authorCrewMemberObject =
          msg.guild &&
          (await client.game.getCrewMember({
            memberId: author.id,
            guildId: msg.guild.id,
          }))
        if (!command.public && !authorCrewMemberObject)
          return send(
            msg,
            `That command is only available to crew members. Use \`${settings.prefix}join\` to join the crew!`,
          )

        let ship
        if (!command.noShip) {
          ship = await game.ship(msg.guild.id)
          if (!ship.ok) return send(msg, ship.message)
        }

        // * execute command
        await command.action({
          msg,
          match,
          settings,
          ship,
          authorIsAdmin,
          authorCrewMemberObject,
          author,
          client,
          game,
        })
      }
    }
  },
  commands,
}
