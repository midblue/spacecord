const runPoll = require(`./runPoll`)
const Discord = require(`discord.js-light`)
const { usageTag } = require(`../../common`)
const { canEdit } = require(`../botcommon`)

module.exports = async ({
  pollType,
  question,
  description,
  embed,
  time = process.env.DEV ? 10000 : GENERAL_VOTE_TIME,
  requirements,
  yesStaminaRequirement,
  minimumMemberPercent,
  msg,
  guild,
  cleanUp = true,
}) => {
  if (!embed) embed = new Discord.MessageEmbed().setColor(APP_COLOR)

  if (question) embed.setTitle(question)
  if (description) embed.description = description

  const reactions = [
    {
      emoji: `✅`,
      label:
        `Yes` +
        (yesStaminaRequirement ? ` ` + usageTag(0, yesStaminaRequirement) : ``),
    },
    {
      emoji: `❌`,
      label: `No`,
    },
  ]

  const {
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
    guild,
  })

  if (!ok) {
    if (sentMessage && cleanUp && (await canEdit(sentMessage)))
      sentMessage.delete().catch(console.log)
    return {
      ok,
      message,
    }
  }

  if (!sentMessage.deleted) {
    if (cleanUp && (await canEdit(sentMessage)))
      sentMessage.delete().catch(console.log)
    else {
      if (await canEdit(sentMessage))
        sentMessage.reactions.removeAll().catch(console.log)
      sentMessage.fields = []
    }
  }

  const yesVoters = voters.filter((v) => v.votes.includes(`✅`))
  const noVoters = voters.filter((v) => v.votes.includes(`❌`))

  return {
    ok,
    result: insufficientVotes
      ? false
      : (userReactions[`✅`]?.weightedCount || 0) >
        (userReactions[`❌`]?.weightedCount || 0),
    yesPercent:
      (userReactions[`✅`]?.weightedCount || 0) /
      ((userReactions[`❌`]?.weightedCount || 0) +
        (userReactions[`✅`]?.weightedCount || 0)),
    insufficientVotes,
    voters,
    yesVoters,
    noVoters,
    sentMessage,
    embed,
  }
}
