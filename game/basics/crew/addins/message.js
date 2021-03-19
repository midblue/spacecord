const pushToUser = require(`../../../../discord/actions/pushToUser`)

module.exports = (member) => {
  member.message = async (message, awaitReactionOptions) => {
    if (awaitReactionOptions && !awaitReactionOptions.reactions)
      awaitReactionOptions = { reactions: awaitReactionOptions }
    return await pushToUser({
      userId: member.id,
      guildId: member.guildId,
      message,
      awaitReactionOptions,
    })
  }
}
