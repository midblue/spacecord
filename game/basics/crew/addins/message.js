const pushToUser = require(`../../../../discord/actions/pushToUser`)

module.exports = (member) => {
  member.message = async (message, reactions) => {
    return await pushToUser({
      userId: member.id,
      guildId: member.guildId,
      message,
      reactions,
    })
  }
}
