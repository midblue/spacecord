const pushToUser = require(`../../../../discord/actions/pushToUser`)

module.exports = (member) => {
  member.message = async (message) => {
    const sent = await pushToUser({
      userId: member.id,
      guildId: member.guild.guildId,
      message,
    })
    return sent
  }
}
