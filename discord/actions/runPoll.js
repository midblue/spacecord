const send = require('./send')
const awaitReaction = require('./awaitReaction')

module.exports = async ({
  embed,
  time,
  reactions,
  requirements,
  msg,
  respondeeFilter,
  ship,
}) => {
  if (!embed.fields) embed.fields = []
  embed.fields.push({
    name: 'Remaining vote time:',
    value: (time / 60 / 1000).toFixed(2) + ' minutes',
  })

  const startTime = Date.now()
  let remainingTime = time
  let done = false

  const sentMessages = await send(msg, embed)
  const lastMessage = sentMessages[sentMessages.length - 1]

  const embedUpdateInterval = setInterval(() => {
    if (done === true) return clearInterval(embedUpdateInterval)
    remainingTime = startTime + time - Date.now()
    if (remainingTime < 0) remainingTime = 0
    embed.fields = {
      name: 'Remaining vote time:',
      value: (remainingTime / 60 / 1000).toFixed(2) + ' minutes',
    }

    if (remainingTime <= 0) {
      clearInterval(embedUpdateInterval)
      done = true
    }
    lastMessage.edit(embed)
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
    msg: lastMessage,
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

  return {
    userReactions: userReactionsToUse,
    lastMessage,
  }
}
