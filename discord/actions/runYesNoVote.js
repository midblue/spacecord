const send = require('./send')
const runPoll = require('./runPoll')
const Discord = require('discord.js')

module.exports = async ({
  question,
  embed,
  time = process.env.GENERAL_VOTE_TIME,
  requirements,
  minimumMemberPercent,
  msg,
  ship,
}) => {
  if (!embed) embed = new Discord.MessageEmbed().setColor(process.env.APP_COLOR)

  embed.setTitle(question)

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

  sentMessage.delete()

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
  }
}
