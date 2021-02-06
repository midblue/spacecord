const story = require('../../game/basics/story/story')
const send = require('../actions/send')
const { client } = require('../bot')

module.exports = async ({
  msg,
  reactions,
  embed,
  time = process.env.GENERAL_VOTE_TIME,
  commandsLabel,
  listeningType,
  respondeeFilter,
  guild,
  actionProps,
}) => {
  return new Promise(async (resolve) => {
    if (embed) {
      if ((reactions && reactions.length) || listeningType)
        embed.setFooter(
          `Listening for ${
            listeningType ? listeningType : reactions ? 'commands' : 'reactions'
          }...`,
        )
      if (reactions && reactions.length && reactions[0].label && embed)
        embed.fields.push({
          id: 'commandLabel',
          name: commandsLabel || `Commands`,
          value: reactions
            .map(({ emoji, label }) => `${emoji} - ${label}`)
            .join('\n'),
        })
      msg.edit(embed)
    }

    if (reactions && reactions.length)
      for (let r of reactions) msg.react(r.emoji)

    let collectedReactions = []

    // define an event handler that takes raw API data and filters it

    const eventHandler = async (event) => {
      // `event.t` is the raw event name
      if (event.t !== 'MESSAGE_REACTION_ADD') return

      const { d: data } = event
      const user = await client.users.fetch(data.user_id)
      if (user.bot) return
      if (respondeeFilter && !respondeeFilter(user)) return
      const channel =
        (await client.channels.fetch(data.channel_id)) ||
        (await user.createDM())
      if (channel.id !== msg.channel.id) return
      const message = await channel.messages.fetch(data.message_id)
      if (!message || message.id !== msg.id) return
      const userReactedWithEmoji = data.emoji.id
        ? `${data.emoji.name}:${data.emoji.id}`
        : data.emoji.name

      // if there are specific reaction options
      if (reactions && reactions.length) {
        const chosenReaction = reactions.find(
          (r) => r.emoji === userReactedWithEmoji,
        )
        if (!chosenReaction) return

        // if there are level requirements
        if (chosenReaction.requirements) {
          const member = guild.ship.members.find((m) => m.id === user.id)
          if (!member) return false
          for (let r in chosenReaction.requirements)
            if ((member?.level?.[r] || 0) < chosenReaction.requirements[r]) {
              send(
                msg,
                story.action.doesNotMeetRequirements(
                  chosenReaction.requirements,
                  member,
                ),
              )
              return false
            }
        }
      }

      // todo remove from list if they remove their reaction
      // add it to the list if it's not a repeat
      if (
        !collectedReactions.find(
          (c) => c.user.id === user.id && c.emoji === userReactedWithEmoji,
        )
      )
        collectedReactions.push({ user, emoji: userReactedWithEmoji })

      // run the action for that emoji if there is one
      if (
        !reactions ||
        !reactions.find((r) => r.emoji === userReactedWithEmoji) ||
        !reactions.find((r) => r.emoji === userReactedWithEmoji).action
      )
        return

      msg.author = user
      reactions
        .find((r) => r.emoji === userReactedWithEmoji)
        .action({
          user,
          embed,
          msg,
          emoji: userReactedWithEmoji,
          guild,
          ...(actionProps || {}),
        })
    }

    client.on('raw', eventHandler)

    setTimeout(() => {
      client.off('raw', eventHandler)
      if (embed) {
        delete embed.footer
        if (embed.fields) {
          const fieldIndex = embed.fields.findIndex(
            (f) => f.id === 'commandLabel',
          )
          if (fieldIndex) embed.fields.splice(fieldIndex, 1)
        }
        msg.edit(embed)
      }
      msg.reactions.removeAll().catch((e) => {})
      resolve(collectedReactions)
    }, time)
  })
}
