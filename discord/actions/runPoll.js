const send = require('./send')
const awaitReaction = require('./awaitReaction')
const { msToTimeString, capitalize } = require('../../common')

module.exports = async ({
  embed,
  pollTitle = 'Crew Member Poll',
  time = process.env.GENERAL_VOTE_TIME,
  reactions,
  requirements,
  minimumMemberPercent,
  msg,
  respondeeFilter,
  ship,
}) => {
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

  embed.fields.push({
    name: 'Remaining vote time:',
    value: msToTimeString(time),
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
    userReactions: userReactionsToUse,
    insufficientVotes: !enoughMembersVoted,
    voters: Object.keys(userReactionCounts).length,
    sentMessage,
  }
}
