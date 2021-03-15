const send = require(`./send`)
const { log } = require(`../botcommon`)
const { client } = require(`../bot`)
const awaitReaction = require(`./awaitReaction`)
const manager = require(`../../game/manager`)

module.exports = async ({ id, channelId, message, msg, reactions }) => {
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

    if (!channelId) channelId = (await client.game.guild(id))?.guild?.channel
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
    msg = discordChannel
    sentMessages = await send(msg, message)
  }
  if (reactions) {
    const gameGuildRes = await manager.guild(id)
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
