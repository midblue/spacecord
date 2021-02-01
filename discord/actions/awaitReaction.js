const story = require('../../game/basics/story/story')
const send = require('../actions/send')

module.exports = async ({
  msg,
  reactions,
  embed,
  time = 60000,
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
      if (reactions && reactions[0].label)
        embed.fields.push({
          name: `Commands`,
          value: reactions
            .map(({ emoji, label }) => `${emoji} - ${label}`)
            .join('\n'),
        })
      msg.edit(embed)
    }

    if (reactions) for (let r of reactions) msg.react(r.emoji)

    const filter = (userReaction, user) => {
      if (user.bot) return false
      if (respondeeFilter && !respondeeFilter(user)) return false
      if (!reactions) return true

      const reaction = reactions.find(
        (r) => r.emoji === userReaction.emoji.name,
      )
      if (!reaction) return false

      if (reaction.requirements) {
        const member = guild.ship.members.find((m) => m.id === user.id)
        if (!member) return false
        for (let r in reaction.requirements)
          if (((member.skills || {})[r] || 0) < reaction.requirements[r]) {
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

    collector.on('collect', (reaction, user) => {
      if (
        !reactions ||
        !reactions.find((r) => r.emoji === reaction.emoji.name) ||
        !reactions.find((r) => r.emoji === reaction.emoji.name).action
      )
        return
      reactions
        .find((r) => r.emoji === reaction.emoji.name)
        .action({ user, embed, msg, reaction })
    })

    collector.on('end', (collected) => {
      if (embed) {
        delete embed.footer
        if (reactions && reactions[0].label) embed.fields.pop()
        msg.edit(embed)
      }
      msg.reactions.removeAll().catch((e) => {})
      resolve(collected)
    })
  })
}
