const send = require(`./send`)
const { log } = require(`../botcommon`)
const { client } = require(`../bot`)

module.exports = async ({ userId, guildId, message }) => {
  const user = await client.users.fetch(userId, false)
  if (!user) return log(userId, `pushToUser`, `no user found to push to by id`)

  const sentMessages = await send(user, message)
  return sentMessages
}
