const pushToUser = require(`../../../../discord/actions/pushToUser`)

module.exports = (member) => {
  member.message = async (message, reactions) => {
    await pushToUser({
      userId: member.id,
      guildId: member.guild.guildId,
      message,
      reactions,
    })
  }
}
