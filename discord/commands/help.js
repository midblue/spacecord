const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js')
const defaultServerSettings = require('../defaults/defaultServerSettings')

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

//{ name: '\u200B', value: '\u200B' },

module.exports = {
  tag: 'help',
  public: true,
  noShip: true,
  documentation: {
    name: `help`,
    value: `Shows this command.`,
    emoji: 'ℹ️',
    priority: 100,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:help|h|info|i)$`, 'gi').exec(
      content,
    )
  },
  async action({ msg, settings, game, client }) {
    log(msg, 'Test')
    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Info`)
      .setDescription(`It's a space game, know what I mean?`)
      .addFields(
        commands
          .sort(
            (a, b) =>
              ((b.documentation || {}).priority || 0) -
              ((a.documentation || {}).priority || 0),
          )
          .map((c) => ({
            name: `${(c.documentation || {}).emoji || ''} \`${
              (settings || {}).prefix || defaultServerSettings.prefix
            }${(c.documentation || {}).name || c.tag}\``,
            value: (c.documentation || {}).value || 'Self-explanatory.',
            inline: true,
          })),
      )

    send(msg, embed)
  },
}
