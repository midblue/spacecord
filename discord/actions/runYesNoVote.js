const send = require('./send')
const runPoll = require('./runPoll')
const Discord = require('discord.js-light')

module.exports = async ({
  type, // todo use type to make sure we don't have two of the same poll open at once
  question,
  embed,
  time = process.env.GENERAL_VOTE_TIME,
  requirements,
  minimumMemberPercent,
  msg,
  ship,
  cleanUp = true,
}) => {
  if (!embed) embed = new Discord.MessageEmbed().setColor(process.env.APP_COLOR)

  if (question) embed.setTitle(question)

  const reactions = [
    {
      emoji: '✅',
      label: 'Yes',
    },
    {
      emoji: '❌',
      label: 'No',
    },
  ]
  const {
    userReactions,
    sentMessage,
    insufficientVotes,
    voters,
  } = await runPoll({
    embed,
    time,
    reactions,
    requirements,
    minimumMemberPercent,
    msg,
    ship,
  })

  if (cleanUp) sentMessage.delete()
  else {
    sentMessage.reactions.removeAll().catch((e) => {})
    sentMessage.fields = []
  }

  return {
    result: insufficientVotes
      ? false
      : (userReactions['✅']?.weightedCount || 0) >
        (userReactions['❌']?.weightedCount || 0),
    yesPercent:
      (userReactions['✅']?.weightedCount || 0) /
      ((userReactions['❌']?.weightedCount || 0) +
        (userReactions['✅']?.weightedCount || 0)),
    insufficientVotes,
    voters,
    sentMessage,
  }
}
