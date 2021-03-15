const send = require(`./send`)
const { log } = require(`../botcommon`)
const { client } = require(`../bot`)
const awaitReaction = require(`./awaitReaction`)
const manager = require(`../../game/manager`)

module.exports = async ({ userId, guildId, message, reactions }) => {
  const user = await client.users.fetch(userId, false)
  if (!user) return log(userId, `pushToUser`, `no user found to push to by id`)

  const sentMessages = await send(user, message)

  if (reactions) {
    const gameGuildRes = await manager.guild(guildId)
    if (!gameGuildRes.ok) return
    awaitReaction({
      msg: sentMessages[0],
      reactions,
      embed: message,
      guild: gameGuildRes.guild,
    })
  }

  return sentMessages
}
