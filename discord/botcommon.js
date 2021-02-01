const defaultServerSettings = require('./defaults/defaultServerSettings')

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
  applyCustomParams,
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

async function username(msgOrUserOrChannel, id) {
  let user
  if (id) user = (await getUserInGuildById(msgOrUserOrChannel.guild, id)) || {}
  else if (msgOrUserOrChannel.author) user = msgOrUserOrChannel.author
  else if (msgOrUserOrChannel.username) {
    user = msgOrUserOrChannel
  }
  if (!user) return 'System'
  return user.nickname || user.username || user.user.username || 'Unknown User'
}

const customParams = [
  {
    regex: /%username%(\d+)%/,
    async replace([unused, userId], msgOrChannel) {
      return await username(msgOrChannel, userId)
    },
  },
  {
    regex: /%command%(.+)%/,
    async replace([unused, command], msgOrChannel) {
      // todo get server command prefix here (once we implement that)
      return defaultServerSettings.prefix + command
    },
  },
]
function applyCustomParams(msgOrChannel, text) {
  return new Promise(async (resolve) => {
    let newText = text
    for (let param of customParams) {
      param.regex.lastIndex = 0
      let foundInstance = param.regex.exec(newText)
      while (foundInstance) {
        const replaceValue = await param.replace(foundInstance, msgOrChannel)
        newText = newText.replace(foundInstance[0], replaceValue)
        param.regex.lastIndex = 0
        foundInstance = param.regex.exec(newText)
      }
    }
    resolve(newText)
  })
}
