const send = require(`./send`)
const { log } = require(`../botcommon`)
const { client } = require(`../bot`)
const awaitReaction = require(`./awaitReaction`)
const game = require(`../../game/manager`)

module.exports = async ({
  id,
  channelId,
  message,
  msg,
  awaitReactionOptions,
}) => {
  let sentMessages
  if (msg && msg.guild) sentMessages = await send(msg, message)
  else {
    if (!id && msg?.author?.crewMemberObject)
      id = msg.author.crewMemberObject.guildId
    // console.log(`pushtoguild`, id, channelId, message)
    const discordGuild = await client.guilds.fetch(id)
    if (!discordGuild) {
      return log(discordGuild, `message`, `Failed to find guild`, id, channelId)
    }

    if (!channelId) channelId = (await game.guild(id))?.guild?.channel
    const discordChannel = await discordGuild.channels.fetch(channelId)
    if (!discordChannel) {
      return log(
        discordGuild,
        `message`,
        `Failed to find channel:`,
        id,
        channelId,
      )
    }
    msg = { guild: discordGuild, channel: discordChannel }
    sentMessages = await send(msg, message)
  }
  if (awaitReactionOptions) {
    const gameGuildRes = await game.guild(id)
    if (!gameGuildRes.ok) return
    awaitReaction({
      embed: message,
      ...awaitReactionOptions,
      msg: sentMessages[0],
      guild: gameGuildRes.guild,
    })
  }
  return sentMessages
}
