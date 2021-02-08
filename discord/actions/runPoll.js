const send = require('./send')
const awaitReaction = require('./awaitReaction')
const { msToTimeString, capitalize } = require('../../common')
const staminaRequirements = require('../../game/basics/crew/staminaRequirements')
const { guild } = require('../../game/manager')

module.exports = async ({
  pollType,
  embed,
  pollTitle = 'Crew Member Poll',
  time = process.env.GENERAL_VOTE_TIME,
  reactions,
  requirements,
  // staminaRequirement,
  minimumMemberPercent,
  msg,
  respondeeFilter,
  ship,
}) => {
  // make sure there's not another active poll of this type running
  const thisGuild = ((await guild(msg.guild.id)) || {}).guild
  if (!thisGuild)
    return {
      ok: false,
      message: `Failed to find guild!`,
    }
  if (!thisGuild.activePolls) thisGuild.activePolls = {}
  if (pollType && thisGuild.activePolls[pollType])
    return {
      ok: false,
      message: `${
        msg?.user?.nickname ? msg.user.nickname + ', t' : 'T'
      }here is already a ${pollType} poll active! Wait for it to complete before starting another.`,
    }
  thisGuild.activePolls[pollType] = true

  // make default embed if missing
  if (!embed)
    embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(pollTitle)
  if (!embed.fields) embed.fields = []

  const minimumMembersMustVote = minimumMemberPercent
    ? Math.ceil(ship.members.length * minimumMemberPercent)
    : -1

  if (minimumMembersMustVote > 0)
    embed.fields.push({
      name: 'Member requirement',
      value: `At least \`${Math.round(
        minimumMemberPercent * 100,
      )}%\` of the crew (\`${minimumMembersMustVote}\` member${
        minimumMembersMustVote === 1 ? '' : 's'
      }) must vote for this vote to be valid.`,
    })

  if (requirements)
    embed.fields.push({
      name: 'Level requirements',
      value: `Voters must have at least ${Object.keys(requirements)
        .map((r) => `level \`${requirements[r]}\` in \`${capitalize(r)}\``)
        .join(' and ')} for their vote to be counted.`,
    })

  // if (staminaRequirement && staminaRequirements[staminaRequirement])
  //   embed.fields.push({
  //     name: 'Stamina to Vote',
  // 		value: `\`- 💪${staminaRequirements[staminaRequirement]}\``,
  // 		inline: true
  //   })

  embed.fields.push({
    name: 'Remaining vote time:',
    value: msToTimeString(time),
    inline: true,
    id: 'remainingTime',
  })

  const startTime = Date.now()
  let remainingTime = time
  let done = false

  const sentMessages = await send(msg, embed)
  const sentMessage = sentMessages[sentMessages.length - 1]

  const embedUpdateInterval = setInterval(() => {
    if (done === true) return clearInterval(embedUpdateInterval)
    remainingTime = startTime + time - Date.now()
    if (remainingTime < 0) remainingTime = 0
    embed.fields[
      embed.fields.findIndex((f) => f.id === 'remainingTime')
    ].value = msToTimeString(time)

    if (remainingTime <= 0) {
      clearInterval(embedUpdateInterval)
      done = true
    }
    sentMessage.edit(embed)
  }, 5000)

  if (!respondeeFilter)
    respondeeFilter = (user) => {
      const member = ship.members.find((m) => m.id === user.id)
      if (!member) return false
      if (requirements)
        for (let r in requirements)
          if ((member?.level?.[r] || 0) < requirements[r]) return false
      return true
    }

  const gatheredReactions = await awaitReaction({
    msg: sentMessage,
    reactions,
    embed,
    time: time,
    listeningType: 'votes',
    respondeeFilter,
  })
  done = true
  if (pollType) delete thisGuild.activePolls[pollType]

  embed.fields.splice(
    embed.fields.findIndex((f) => f.id === 'remainingTime'),
    1,
  )
  sentMessage.edit(embed)

  const userReactionsToUse = {}
  const userReactionCounts = {}

  // todo weight by higher level / role / rank

  gatheredReactions.forEach(({ user, emoji }) => {
    userReactionCounts[user.id] = (userReactionCounts[user.id] || 0) + 1
  })
  gatheredReactions.forEach(({ user, emoji }) => {
    userReactionsToUse[emoji] = userReactionsToUse[emoji] || {}
    userReactionsToUse[emoji].weightedCount =
      (userReactionsToUse[emoji].weightedCount || 0) +
      1 / userReactionCounts[user.id] / Object.keys(userReactionCounts).length
  })

  const validVotes = gatheredReactions.length
  embed.setFooter(
    `(${validVotes} valid vote${validVotes === 1 ? '' : 's'} counted)`,
  )

  const enoughMembersVoted =
    Object.keys(userReactionCounts).length >= minimumMembersMustVote

  return {
    ok: true,
    userReactions: userReactionsToUse,
    insufficientVotes: !enoughMembersVoted,
    voters: Object.keys(userReactionCounts).length,
    sentMessage,
  }
}
