const story = require('../../game/basics/story/story')
const send = require('../actions/send')
const { client, rawWatchers } = require('../bot')
const { username } = require('../botcommon')
const Discord = require('discord.js-light')

module.exports = async ({
  msg,
  reactions,
  embed,
  time = GENERAL_RESPONSE_TIME,
  commandsLabel,
  listeningType,
  respondeeFilter,
  guild,
  actionProps,
  allowNonMembers = false,
  removeUserReactions = true,
  endOnReaction = false
}) => {
  return new Promise(async (resolve) => {
    // make sure all other edits have gone through so we don't lose the commands
    // todo confirm this works
    await SLEEP(200)

    let ended = false

    if (embed) {
      if ((reactions && reactions.length) || listeningType) {
        embed.setFooter(
          `Listening for ${
            listeningType || (reactions ? 'commands' : 'reactions')
          }...`
        )
      }
      if (reactions && reactions.length && reactions[0].label && embed) {
        embed.fields.push({
          id: 'commandLabel',
          name: commandsLabel || 'Commands',
          value: reactions
            .map(({ emoji, label }) => `${emoji} - ${label}`)
            .join('\n')
        })
      }
      if (reactions && reactions.length && !msg.deleted) msg.edit(embed)
    }

    if (reactions && reactions.length && !msg.deleted) { for (const r of reactions) msg.react(r.emoji) }

    const collectedReactions = []

    // ending function
    const end = () => {
      if (ended) return
      ended = true
      rawWatchers.splice(rawWatchers.indexOf(eventHandler), 1)
      if (embed) {
        delete embed.footer
        if (embed.fields) {
          // console.log(JSON.stringify(embed.fields) + '121221313123')
          const fieldIndex = embed.fields.findIndex(
            (f) => f.id === 'commandLabel'
          )
          if (fieldIndex) embed.fields.splice(fieldIndex, 1)
        }
        if (!msg.deleted) msg.edit(embed)
      }
      if (!msg.deleted) msg.reactions.removeAll().catch((e) => {})
      resolve(collectedReactions)
    }

    // define an event handler that takes raw API data and filters it
    const eventHandler = async (event) => {
      // `event.t` is the raw event name
      if (
        !['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(event.t)
      ) { return }

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

      // check if they're actually a member of the game
      const member = (guild?.ship?.members || []).find((m) => m.id === user.id)
      if (!allowNonMembers && !member) return

      if (removeUserReactions) {
        const reaction = await new Discord.MessageReaction(client, data, msg)
        reaction.users.remove(data.user_id)
      }

      const userReactedWithEmoji = data.emoji.id
        ? `${data.emoji.name}:${data.emoji.id}`
        : data.emoji.name

      // if there are specific reaction options
      if (reactions && reactions.length) {
        const chosenReaction = reactions.find(
          (r) => r.emoji === userReactedWithEmoji
        )
        if (!chosenReaction) return

        // if there are level requirements
        if (chosenReaction.requirements) {
          if (!member) return
          for (const r in chosenReaction.requirements) {
            if ((member?.level?.[r] || 0) < chosenReaction.requirements[r]) {
              send(
                msg,
                story.action.doesNotMeetRequirements(
                  chosenReaction.requirements,
                  member
                )
              )
              return
            }
          }
        }
      }

      // add it to the list if it's not a repeat
      if (
        !collectedReactions.find(
          (c) => c.user.id === user.id && c.emoji === userReactedWithEmoji
        ) &&
        event.t === 'MESSAGE_REACTION_ADD'
      ) { collectedReactions.push({ user, emoji: userReactedWithEmoji }) } else if (event.t === 'MESSAGE_REACTION_REMOVE') {
        collectedReactions.splice(
          collectedReactions.indexOf(
            (r) => r.user.id === user.id && r.emoji === userReactedWithEmoji
          ),
          1
        )
      }

      // run the action for that emoji if there is one
      if (
        event.t !== 'MESSAGE_REACTION_ADD' ||
        !reactions ||
        !reactions.find((r) => r.emoji === userReactedWithEmoji) ||
        !reactions.find((r) => r.emoji === userReactedWithEmoji).action
      ) { return }

      // console.log(userReactedWithEmoji)

      msg.author = user
      if (!msg.author.nickname) { msg.author.nickname = await username(msg, msg.author.id) }
      reactions
        .find((r) => r.emoji === userReactedWithEmoji)
        .action({
          user,
          embed,
          msg,
          emoji: userReactedWithEmoji,
          guild,
          ...(actionProps || {})
        })

      if (endOnReaction) end()
    }

    rawWatchers.push(eventHandler)

    setTimeout(end, time)
  })
}
