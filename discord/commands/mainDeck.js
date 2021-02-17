const send = require('../actions/send')
const { log } = require('../botcommon')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js-light')
const runGuildCommand = require('../actions/runGuildCommand')

module.exports = {
  tag: 'mainDeck',
  documentation: false,
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:maindeck)$`, 'gi').exec(content)
  },
  async action({ msg, guild }) {
    log(msg, 'Main Deck', msg.guild.name)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`🎛 Main Deck`)

    embed.description = `The main deck of the ship hums with activity as deck workers tend to the ship's equipment and cargo, and overseers monitor the ship's status.`

    const reactions = [
      {
        emoji: '📊',
        label: 'Ship Info',
        async action({ msg }) {
          await runGuildCommand({
            commandTag: 'shipInfo',
            msg,
          })
        },
      },
      {
        emoji: '📦',
        label: 'Cargo',
        async action({ msg }) {
          await runGuildCommand({
            commandTag: 'cargo',
            msg,
          })
        },
      },

      {
        emoji: '🔩',
        label: 'Equipment',
        async action({ msg }) {
          await runGuildCommand({
            commandTag: 'equipment',
            msg,
          })
        },
      },
      {
        emoji: '🧾',
        label: 'Ship Log',
        async action({ msg }) {
          await runGuildCommand({
            msg,
            commandTag: 'log',
          })
        },
      },
    ]

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions,
      embed,
      guild,
      respondeeFilter: (user) => user.id === msg.author.id,
    })
    sentMessage.delete()
  },
}
