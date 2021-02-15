const send = require('./send')
const awaitReaction = require('./awaitReaction')
const { msToTimeString, capitalize } = require('../../common')
const staminaRequirements = require('../../game/basics/crew/staminaRequirements')
const { guild } = require('../../game/manager')
const manager = require('../../game/manager')
const Discord = require('discord.js-light')

module.exports = async ({
  pollType,
  embed,
  pollTitle = 'Crew Member Poll',
  time = process.env.GENERAL_VOTE_TIME,
  reactions,
  requirements,
  staminaRequirements,
  minimumMemberPercent,
  weightByLevelType,
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
    remainingTime -= Math.abs(startTime - Date.now())
    if (remainingTime < 0) remainingTime = 0
    embed.fields[
      embed.fields.findIndex((f) => f.id === 'remainingTime')
    ].value = msToTimeString(remainingTime)

    if (remainingTime <= 0) {
      clearInterval(embedUpdateInterval)
      done = true
    }
    if (!sentMessage.deleted) sentMessage.edit(embed)
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
  if (!sentMessage.deleted) sentMessage.edit(embed)

  const userReactionsToUse = {}
  const userReactionCounts = {}
  const voters = []

  // todo weight by higher level / role / rank

  let guildMembers
  if (staminaRequirements)
    guildMembers = (await manager.guild(msg.guild.id)).guild?.ship?.members

  gatheredReactions.forEach(({ user, emoji }) => {
    if (staminaRequirements && staminaRequirements[emoji] && guildMembers) {
      const member = guildMembers.find((m) => m.id === user.id)
      if (!member.useStamina(staminaRequirements[emoji]).ok) return
    }
    userReactionCounts[user.id] = (userReactionCounts[user.id] || 0) + 1
    const foundVoter = voters.find((v) => v.id === user.id)
    if (foundVoter) foundVoter.votes.push(emoji)
    else voters.push({ ...user, votes: [emoji] })
  })
  gatheredReactions.forEach(({ user, emoji }) => {
    let userWeight = 1
    if (weightByLevelType) {
      const gameMember = ship.members.find((m) => m.id === user.id)
      userWeight = gameMember?.level?.[weightByLevelType] || 1
    }
    userReactionsToUse[emoji] = userReactionsToUse[emoji] || {}
    userReactionsToUse[emoji].weightedCount =
      (userReactionsToUse[emoji].weightedCount || 0) +
      userWeight /
        userReactionCounts[user.id] /
        Object.keys(userReactionCounts).length
  })

  embed.setFooter(
    `(${voters.length} valid member${voters.length === 1 ? '' : 's'} voted)`,
  )

  const enoughMembersVoted = voters.length >= minimumMembersMustVote

  const winner =
    enoughMembersVoted &&
    Object.keys(userReactionsToUse).reduce(
      (highest, key) => {
        if (userReactionsToUse[key].weightedCount > highest.weightedCount)
          return {
            emoji: key,
            weightedCount: userReactionsToUse[key].weightedCount,
          }
        return highest
      },
      { weightedCount: -1 },
    )?.emoji
  return {
    ok: true,
    userReactions: userReactionsToUse,
    insufficientVotes: !enoughMembersVoted,
    voters,
    sentMessage,
    embed,
    winner,
  }
}
