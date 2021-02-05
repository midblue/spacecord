const story = require('../../game/basics/story/story')
const send = require('../actions/send')

module.exports = async ({
  msg,
  reactions,
  embed,
  time = process.env.GENERAL_VOTE_TIME,
  commandsLabel,
  listeningType,
  respondeeFilter,
  guild,
}) => {
  return new Promise(async (resolve) => {
    if (embed) {
      embed.setFooter(
        `Listening for ${
          listeningType ? listeningType : reactions ? 'commands' : 'reactions'
        }...`,
      )
      if (reactions && reactions.length && reactions[0].label && embed)
        embed.fields.push({
          name: commandsLabel || `Commands`,
          value: reactions
            .map(({ emoji, label }) => `${emoji} - ${label}`)
            .join('\n'),
        })
      msg.edit(embed)
    }

    if (reactions && reactions.length)
      for (let r of reactions) msg.react(r.emoji)

    const filter = (userReaction, user) => {
      if (user.bot) return false
      if (respondeeFilter && !respondeeFilter(user)) return false
      if (!reactions || !reactions.length) return true

      const reaction = reactions.find(
        (r) => r.emoji === userReaction.emoji.name,
      )
      if (!reaction) return false

      if (reaction.requirements) {
        const member = guild.ship.members.find((m) => m.id === user.id)
        if (!member) return false
        for (let r in reaction.requirements)
          if ((member?.level?.[r] || 0) < reaction.requirements[r]) {
            send(
              msg,
              story.action.doesNotMeetRequirements(
                reaction.requirements,
                member,
              ),
            )
            return false
          }
      }

      return true
    }

    const collector = msg.createReactionCollector(filter, { time })

    let collected = []
    collector.on('collect', (reaction, user) => {
      console.log(reaction.emoji.name)
      collected.push(reaction)
      if (
        !reactions ||
        !reactions.find((r) => r.emoji === reaction.emoji.name) ||
        !reactions.find((r) => r.emoji === reaction.emoji.name).action
      )
        return
      msg.author = user
      reactions
        .find((r) => r.emoji === reaction.emoji.name)
        .action({ user, embed, msg, reaction, guild })
    })

    collector.on('end', () => {
      console.log('end reaction collector')
      if (embed) {
        delete embed.footer
        if (
          reactions &&
          reactions.length &&
          reactions[0].label &&
          embed.fields &&
          embed.fields.length
        )
          embed.fields.pop()
        msg.edit(embed)
      }
      msg.reactions.removeAll().catch((e) => {})
      resolve(collected)
    })
  })
}
