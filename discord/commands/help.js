const send = require('../actions/send')
const defaultServerSettings = require('../defaults/defaultServerSettings')
const { log } = require('../botcommon')
const Discord = require('discord.js-light')
const awaitReaction = require('../actions/awaitReaction')
const helpPage = require('../actions/help/page')

// * get all commands from files in this folder
const fs = require('fs')
let commands = []
fs.readdir('./discord/commands', (err, files) => {
  files.forEach((file) => {
    if (
      !file.endsWith('.js') ||
      file === 'index.js' ||
      file.startsWith('debug')
    )
      return
    commands.push(require(`./${file}`))
    commands = commands.filter((c) => c && c.documentation)
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
    log(msg, 'Help')

    const reactions = []
    reactions.push(
      ...[
        {
          emoji: '📖',
          label: `How To Play`,
          action: async () => {
            helpPage({
              msg,
              settings,
              user: msg.author,
              emoji: '📖',
              title: 'How To Play',
              commands: [], // todo add spawn and join commands here
            })
          },
        },
        {
          emoji: '🚀',
          label: `Ship Controls and Status`,
          action: async () => {
            helpPage({
              msg,
              settings,
              user: msg.author,
              emoji: '🚀',
              title: `Ship Controls and Status`,
              description: `View and control the ship's status and movement.`,
              commands: commands.filter(
                (c) => c.documentation.category === 'ship',
              ),
            })
          },
        },
        {
          emoji: '👋',
          label: `Interaction Commands`,
          action: async () => {
            helpPage({
              msg,
              settings,
              user: msg.author,
              emoji: '👋',
              title: `Interaction Commands`,
              description: `Interact with the world and other ships around you.`,
              commands: commands.filter(
                (c) => c.documentation.category === 'interaction',
              ),
            })
          },
        },
        {
          emoji: '👨‍👩‍👧‍👦',
          label: `Crew Commands`,
          action: async () => {
            helpPage({
              msg,
              settings,
              user: msg.author,
              emoji: '👨‍👩‍👧‍👦',
              title: `Crew Commands`,
              description: `View and upgrade your character, and see the whole crew.`,
              commands: commands.filter(
                (c) => c.documentation.category === 'crew',
              ),
            })
          },
        },
        {
          emoji: '👩‍✈️',
          label: `Captain's Commands`,
          action: async () => {
            helpPage({
              msg,
              settings,
              user: msg.author,
              emoji: '👩‍✈️',
              title: `Captain's Commands`,
              description: `Only the ship's captain (or server admins) can do these actions!`,
              commands: commands.filter((c) => c.captain),
            })
          },
        },
        {
          emoji: '⚙️',
          label: `Bot Commands`,
          action: async () => {
            helpPage({
              msg,
              settings,
              user: msg.author,
              emoji: '⚙️',
              title: 'Bot Commands',
              description: 'Help and settings for the bot itself.',
              commands: commands.filter(
                (c) => c.documentation.category === 'settings',
              ),
            })
          },
        },
      ],
    )

    const embed = new Discord.MessageEmbed().setColor(process.env.APP_COLOR)
    embed.title = `ℹ️ ${process.env.GAME_TITLE} | Help`
    embed.description = `Thanks for playing ${process.env.GAME_TITLE}! Here's info about generally what it is, how you play, and so on!
	
Pick a category below to get info on specific commands or elements of the game.`

    // const embed3 = new Discord.MessageEmbed()
    //   .setColor(process.env.APP_COLOR)
    //   .setTitle(`Settings`)
    //   .setDescription(`Help and settings for the bot itself.`)
    //   .addFields(
    //     commands
    //       .filter((c) => c && c.documentation?.category === 'settings')
    //       .sort(
    //         (a, b) =>
    //           (b?.documentation?.priority || 0) -
    //           (a?.documentation?.priority || 0),
    //       )
    //       .map((c) => ({
    //         name: `${c?.documentation?.emoji || ''} \`${
    //           settings?.prefix || defaultServerSettings.prefix
    //         }${c?.documentation?.name || c.tag}\``,
    //         value: c.documentation?.value || 'Self-explanatory.',
    //         inline: true,
    //       })),
    //   )
    // send(msg, embed3)

    // const embed2 = new Discord.MessageEmbed()
    //   .setColor(process.env.APP_COLOR)
    //   .setTitle(`Captain's Controls`)
    //   .setDescription(
    //     `Only the ship's captain (or server admins) can do these actions!`,
    //   )
    //   .addFields(
    //     commands
    //       .filter((c) => c && c.captain)
    //       .sort(
    //         (a, b) =>
    //           (b?.documentation?.priority || 0) -
    //           (a?.documentation?.priority || 0),
    //       )
    //       .map((c) => ({
    //         name: `${c?.documentation?.emoji || ''} \`${
    //           settings?.prefix || defaultServerSettings.prefix
    //         }${c?.documentation?.name || c.tag}\``,
    //         value: c.documentation?.value || 'Self-explanatory.',
    //         inline: true,
    //       })),
    //   )
    // send(msg, embed2)

    // const embed = new Discord.MessageEmbed()
    //   .setColor(process.env.APP_COLOR)
    //   .setTitle(`Gameplay`)
    //   .setDescription(`Controls and commands for playing the game.`)
    //   .addFields(
    //     commands
    //       .filter(
    //         (c) =>
    //           c &&
    //           !c.captain &&
    //           (c.documentation?.category === 'gameplay' ||
    //             !c.documentation?.category),
    //       )
    //       .sort(
    //         (a, b) =>
    //           (b?.documentation?.priority || 0) -
    //           (a?.documentation?.priority || 0),
    //       )
    //       .map((c) => ({
    //         name: `${c?.documentation?.emoji || ''} \`${
    //           settings?.prefix || defaultServerSettings.prefix
    //         }${c?.documentation?.name || c.tag}\``,
    //         value: c.documentation?.value || 'Self-explanatory.',
    //         inline: true,
    //       })),
    //   )
    const sentMessage = (await send(msg, embed))[0]
    awaitReaction({
      msg: sentMessage,
      embed,
      reactions,
      commandsLabel: 'Info categories',
      listeningType: 'category selection',
    })
  },
}
