module.exports = {
  async log(msg, identifier, context, type = 'command') {
    console.log(
      `${msg.guild ? msg.guild.name : 'Private Message'}`
        .substring(0, 25)
        .padEnd(25, ' ') +
        ` | ${identifier}` +
        (context ? `: ${context}` : ``) +
        ` (${await username(msg)}) `,
    )
  },
  username,
  getUserInGuildById,
}

async function getUserInGuildById(msgOrGuild, id) {
  let guild = msgOrGuild.guild ? msgOrGuild.guild : msgOrGuild
  try {
    const userInGuild = await guild.members.fetch({ user: id })
    return userInGuild
  } catch (e) {
    return false
  }
}

async function username(msgOrUser, id) {
  let user
  if (id) user = (await getUserInGuildById(msgOrUser.guild, id)) || {}
  else if (msgOrUser.author) user = msgOrUser.author
  return user.nickame || user.username || user.user.username || 'Unknown User'
}
