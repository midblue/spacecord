const awaitReaction = require(`./awaitReaction`)

module.exports = async ({ msg, embed, user }) => {
  embed.footer = `Hit the \`🏁\` button to start!`
  console.log(`asadsadsads`, user.id)

  const respondeeFilter = (u) => {
    return u.id === user.id
  }
  const reactions = [{ emoji: `🏁`, action: () => {} }]

  const gatheredReactions = await awaitReaction({
    msg,
    reactions,
    embed,
    listeningType: `🏁 to start`,
    respondeeFilter,
    endOnReaction: true,
    allowNonMembers: true,
  })
  if (!gatheredReactions.length) return false

  return true
}
