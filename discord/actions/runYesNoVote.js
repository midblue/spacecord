const send = require('./send')
const runPoll = require('./runPoll')
const Discord = require('discord.js-light')
const manager = require('../../game/manager')
const { usageTag } = require('../../common')

module.exports = async ({
  pollType, // todo use type to make sure we don't have two of the same poll open at once
  question,
  description,
  embed,
  time = process.env.DEV ? 10000 : process.env.GENERAL_VOTE_TIME,
  requirements,
  yesStaminaRequirement,
  minimumMemberPercent,
  msg,
  ship,
  cleanUp = true,
}) => {
  if (!embed) embed = new Discord.MessageEmbed().setColor(process.env.APP_COLOR)

  if (question) embed.setTitle(question)
  if (description) embed.description = description

  const reactions = [
    {
      emoji: '✅',
      label:
        'Yes' +
        (yesStaminaRequirement ? ' ' + usageTag(0, yesStaminaRequirement) : ''),
    },
    {
      emoji: '❌',
      label: 'No',
    },
  ]

  let {
    ok,
    message,
    userReactions,
    sentMessage,
    insufficientVotes,
    voters,
  } = await runPoll({
    pollType,
    embed,
    time,
    reactions,
    requirements,
    staminaRequirements: yesStaminaRequirement
      ? { '✅': yesStaminaRequirement }
      : null,
    minimumMemberPercent,
    msg,
    ship,
  })

  if (!ok) {
    if (sentMessage && cleanUp) sentMessage.delete()
    return {
      ok,
      message,
    }
  }

  if (cleanUp) sentMessage.delete()
  else {
    sentMessage.reactions.removeAll().catch((e) => {})
    sentMessage.fields = []
  }

  const yesVoters = voters.filter((v) => v.votes.includes('✅'))
  const noVoters = voters.filter((v) => v.votes.includes('❌'))

  return {
    ok,
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
    yesVoters,
    noVoters,
    sentMessage,
    embed,
  }
}
