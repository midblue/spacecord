const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js')
const defaultServerSettings = require('../defaults/defaultServerSettings')

// * get all commands from files in this folder
const fs = require('fs')
const commands = []
fs.readdir('./discord/commands', (err, files) => {
  files.forEach((file) => {
    if (
      !file.endsWith('.js') ||
      file === 'index.js' ||
      file.startsWith('debug')
    )
      return
    commands.push(require(`./${file}`))
  })
})

//{ name: '\u200B', value: '\u200B' },

module.exports = {
  tag: 'help',
  public: true,
  noShip: true,
  documentation: {
    name: `help`,
    value: `Shows this message.`,
    emoji: 'ℹ️',
    category: 'settings',
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
      .setTitle(`Gameplay`)
      .setDescription(`Controls and commands for playing the game.`)
      .addFields(
        commands
          .filter(
            (c) =>
              c.documentation?.category === 'gameplay' ||
              !c.documentation?.category,
          )
          .filter((c) => c !== false)
          .sort(
            (a, b) =>
              (b?.documentation?.priority || 0) -
              (a?.documentation?.priority || 0),
          )
          .map((c) => ({
            name: `${c?.documentation?.emoji || ''} \`${
              settings?.prefix || defaultServerSettings.prefix
            }${c?.documentation?.name || c.tag}\``,
            value: c.documentation?.value || 'Self-explanatory.',
            inline: true,
          })),
      )

    send(msg, embed)

    const embed2 = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Settings`)
      .setDescription(`Help and settings for the bot itself.`)
      .addFields(
        commands
          .filter((c) => c.documentation?.category === 'settings')
          .filter((c) => c !== false)
          .sort(
            (a, b) =>
              (b?.documentation?.priority || 0) -
              (a?.documentation?.priority || 0),
          )
          .map((c) => ({
            name: `${c?.documentation?.emoji || ''} \`${
              settings?.prefix || defaultServerSettings.prefix
            }${c?.documentation?.name || c.tag}\``,
            value: c.documentation?.value || 'Self-explanatory.',
            inline: true,
          })),
      )

    send(msg, embed2)
  },
}
