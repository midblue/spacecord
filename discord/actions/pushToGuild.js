const send = require('./send')
const { log } = require('../botcommon')
const { client } = require('../bot')
const awaitReaction = require('./awaitReaction')
const { guild } = require('../../game/manager')

module.exports = async ({ guildId, channelId, message, msg, reactions }) => {
  let sentMessage
  if (msg) sentMessage = (await send(msg, message))[0]
  else {
    // console.log(guildId, channelId)
    const discordGuild = await client.guilds.fetch(guildId)
    if (!discordGuild) {
      return log(
        discordGuild,
        'pushToGuild',
        'Failed to find guild',
        guildId,
        channelId
      )
    }
    const discordChannel = await discordGuild.channels.fetch(channelId)
    if (!discordChannel) {
      return log(
        discordGuild,
        'pushToGuild',
        'Failed to find channel:',
        guildId,
        channelId
      )
    }
    msg = discordChannel
    sentMessage = (await send(msg, message))[0]
  }
  if (reactions) {
    const gameGuildRes = await guild(guildId)
    if (!gameGuildRes.ok) return
    awaitReaction({
      msg: sentMessage,
      reactions,
      embed: message,
      guild: gameGuildRes.guild
    })
  }
}
