const send = require('../actions/send')

// * get all commands from files in this folder
const fs = require('fs')
const commands = []
fs.readdir('./discord/commands', (err, files) => {
  files.forEach((file) => {
    if (!file.endsWith('.js') || file === 'index.js') return
    commands.push(require(`./${file}`))
  })
  console.log(`Loaded ${commands.length} commands`)
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
        if (command.admin && !authorIsAdmin) {
          send(msg, `That command is only available to server admins.`)
          return true
        }

        // * execute command
        await command.action({
          msg,
          match,
          settings,
          authorIsAdmin,
          author,
          client,
          game,
        })
      }
    }
  },
  commands,
}
