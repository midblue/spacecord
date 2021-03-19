const send = require(`./send`)
const { log } = require(`../botcommon`)
const { client } = require(`../bot`)
const awaitReaction = require(`./awaitReaction`)
const manager = require(`../../game/manager`)

module.exports = async ({ userId, guildId, message, awaitReactionOptions }) => {
  const user = await client.users.fetch(userId, false)
  if (!user) return log(userId, `pushToUser`, `no user found to push to by id`)

  const sentMessages = await send(user, message)

  if (awaitReactionOptions) {
    const gameGuildRes = await manager.guild(guildId)
    if (!gameGuildRes.ok) return
    awaitReaction({
      ...awaitReactionOptions,
      embed: message,
      msg: sentMessages[0],
      guild: gameGuildRes.guild,
    })
  }

  return sentMessages
}
