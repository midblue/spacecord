const send = require('./send')
const awaitReaction = require('./awaitReaction')
const { msToTimeString } = require('../../common')

module.exports = async ({
  embed,
  time = process.env.GENERAL_VOTE_TIME,
  reactions,
  requirements,
  minimumMemberPercent,
  msg,
  respondeeFilter,
  ship,
}) => {
  if (!embed.fields) embed.fields = []

  const minimumMembersMustVote = minimumMemberPercent
    ? Math.ceil(ship.members.length * minimumMemberPercent)
    : -1
  let currentMembersVoted = {}

  if (minimumMembersMustVote > 0)
    embed.fields.push({
      name: 'Member requirement',
      value: `At least ${Math.round(
        minimumMemberPercent * 100,
      )}% of the crew (${minimumMembersMustVote} members) must vote for this vote to be valid.`,
    })

  embed.fields.push({
    name: 'Remaining vote time:',
    value: msToTimeString(time),
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
    embed.fields[embed.fields.length - 2] = {
      name: 'Remaining vote time:',
      value: msToTimeString(time),
    }

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

  const userReactionsToUse = {}
  const userReactionsAsList = []
  const userReactionCounts = {}

  // todo weight by higher level / role / rank

  gatheredReactions.forEach((r) => {
    const ids = r.users.cache
      .array()
      .filter((u) => !u.bot)
      .map((u) => u.id)

    ids.forEach((id) => {
      currentMembersVoted[id] = true
      userReactionCounts[id] = (userReactionCounts[id] || 0) + 1
    })

    userReactionsAsList.push(
      ...ids.map((id) => ({ userId: id, emoji: r.emoji.name })),
    )
  })
  userReactionsAsList.forEach((r) => {
    userReactionsToUse[r.emoji] = userReactionsToUse[r.emoji] || {}
    userReactionsToUse[r.emoji].weightedCount =
      (userReactionsToUse[r.emoji].weightedCount || 0) +
      1 / userReactionCounts[r.userId] / Object.keys(userReactionCounts).length
  })

  const validVotes = userReactionsAsList.length
  embed.setFooter(
    `(${validVotes} valid vote${validVotes === 1 ? '' : 's'} counted)`,
  )

  const enoughMembersVoted =
    Object.keys(currentMembersVoted).length >= minimumMembersMustVote

  return {
    userReactions: userReactionsToUse,
    insufficientVotes: !enoughMembersVoted,
    voters: Object.keys(currentMembersVoted).length,
    sentMessage,
  }
}
