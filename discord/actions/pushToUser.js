const send = require(`./send`)
const { log } = require(`../botcommon`)
const { client } = require(`../bot`)
const awaitReaction = require(`./awaitReaction`)
const { guild } = require(`../../game/manager`)

module.exports = async ({ userId, guildId, message, reactions }) => {
  const user = await client.users.fetch(userId, false)
  if (!user) return log(userId, `pushToUser`, `no user found to push to by id`)

  const sentMessage = (await send(user, message))[0]

  if (reactions) {
    const gameGuildRes = await guild(guildId)
    if (!gameGuildRes.ok) return
    // sentMessage.author = user
    // todo this part doesn't work yet, tbd once we have user data divorced from ships

    awaitReaction({
      msg: sentMessage,
      reactions,
      embed: message,
      guild: gameGuildRes.guild,
    })
  }
}
