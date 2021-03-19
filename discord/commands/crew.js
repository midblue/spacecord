const { usageTag } = require(`../../common`)
const send = require(`../actions/send`)
const { log, username, canEdit } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const runGuildCommand = require(`../actions/runGuildCommand`)
const awaitReaction = require(`../actions/awaitReaction`)

module.exports = {
  tag: `crewQuarters`,
  pmOnly: true,
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:crew|crews?quarters?)$`,
      `gi`,
    ).exec(content)
  },
  async action({ msg, guild }) {
    log(msg, `Crew`, msg.guild?.name)
    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`👨‍👩‍👧‍👧 Crew Quarters`)

    embed.description = `This section of the ship has the smell of life about it. Off-duty members pass by — on their way to the mess hall, no doubt, or to the gym for training.`

    embed.fields = [
      {
        name: `👩‍👩‍👧‍👦 Crew`,
        value: guild.ship.members.length + ` members`,
        inline: true,
      },
    ]

    const reactions = [
      {
        emoji: `🏆`,
        label: `Crew Rankings`,
        async action({ msg }) {
          runGuildCommand({
            msg,
            commandTag: `rankings`,
          })
        },
      },
      {
        emoji: `🏋️‍♂️`,
        label: `Train your skills`,
        action: async ({ msg }) => {
          runGuildCommand({ msg, commandTag: `train` })
        },
      },
    ]
    await send(embed, {
      reactions,
      respondeeFilter: (user) => user.id === msg.author.id,
    })
  },
}
