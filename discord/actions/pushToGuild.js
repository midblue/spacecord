const send = require(`./send`)
const { log } = require(`../botcommon`)
const { client } = require(`../bot`)
const awaitReaction = require(`./awaitReaction`)
const { guild } = require(`../../game/manager`)

module.exports = async ({ id, channelId, message, msg, reactions }) => {
  let sentMessage
  if (msg && msg.guild) sentMessage = (await send(msg, message))[0]
  else {
    // console.log(id, channelId)
    const discordGuild = await client.guilds.fetch(id)
    if (!discordGuild) {
      return log(
        discordGuild,
        `pushToGuild`,
        `Failed to find guild`,
        id,
        channelId,
      )
    }

    if (!channelId) channelId = (await client.game.guild(id))?.guild?.channel
    const discordChannel = await discordGuild.channels.fetch(channelId)
    if (!discordChannel) {
      return log(
        discordGuild,
        `pushToGuild`,
        `Failed to find channel:`,
        id,
        channelId,
      )
    }
    msg = discordChannel
    sentMessage = (await send(msg, message))[0]
  }
  if (reactions) {
    const gameGuildRes = await guild(id)
    if (!gameGuildRes.ok) return
    awaitReaction({
      msg: sentMessage,
      reactions,
      embed: message,
      guild: gameGuildRes.guild,
    })
  }
}
