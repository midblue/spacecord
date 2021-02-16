const send = require('../send')
const runGuildCommand = require('../runGuildCommand')
const { log } = require('../../botcommon')
const Discord = require('discord.js-light')
const defaultServerSettings = require('../../defaults/defaultServerSettings')
const awaitReaction = require('../awaitReaction')

module.exports = async ({
  msg,
  settings,
  user,
  emoji,
  title,
  description,
  commands,
}) => {
  log(msg, 'Help/Page', title)

  commands = commands.sort(
    (a, b) =>
      (b?.documentation?.priority || 0) - (a?.documentation?.priority || 0),
  )

  const embed = new Discord.MessageEmbed()
    .setColor(process.env.APP_COLOR)
    .setTitle('ℹ️ Help: ' + emoji + ' ' + title)
    .setDescription(description || '')
    .addFields(
      commands.map((c) => ({
        name: `${c?.documentation?.emoji || ''} \`${
          settings?.prefix || defaultServerSettings.prefix
        }${c?.documentation?.name || c.tag}\``,
        value: c.documentation?.value || 'Self-explanatory.',
        inline: true,
      })),
    )

  if (emoji === '📖')
    embed.fields = [
      {
        name: 'What is This Game, Anyway?',
        value: 'tbd',
      },
      {
        name: 'Getting Started',
        value: 'tbd',
      },
      {
        name: 'Managing the Ship',
        value: 'tbd',
      },
      {
        name: 'Managing your Character',
        value: 'tbd (skills, training, stamina)',
      },
      {
        name: 'Interacting With Other Ships',
        value: 'tbd',
      },
      {
        name: 'Earning Credits',
        value: 'tbd',
      },
      {
        name: 'Planets',
        value: 'tbd',
      },
      {
        name: 'Upgrading Your Ship',
        value: 'tbd',
      },
      {
        name: '"We Died! What Now?"',
        value: 'tbd',
      },
    ]

  const commandsAsReactions = commands
    .filter(
      (c) => !c.documentation.name || c.documentation.name.indexOf('<') === -1,
    )
    .map((c) => {
      return {
        emoji: c.documentation.emoji,
        action: async () => {
          runGuildCommand({ msg, commandTag: c.tag })
        },
      }
    })
  const sentMessage = (await send(msg, embed))[0]
  sentMessage.author = user
  await awaitReaction({
    msg: sentMessage,
    reactions: commandsAsReactions,
    allowNonMembers: true,
  })
}
