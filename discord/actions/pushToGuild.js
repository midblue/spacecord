const send = require('./send')
const { log } = require('../botcommon')
const { client } = require('../bot')

module.exports = async ({ guildId, channelId, message, msg }) => {
  if (msg) return send(msg, message)

  const discordGuild = await client.guilds.fetch(guildId)
  if (!discordGuild)
    return log(
      discordGuild,
      'pushToGuild',
      'Failed to find guild',
      guildId,
      channelId,
    )
  const discordChannel = await discordGuild.channels.cache
    .array()
    .find((channel) => channel.type === 'text' && channel.id === channelId)
  if (!discordChannel)
    return log(
      discordGuild,
      'pushToGuild',
      'Failed to find channel:',
      guildId,
      channelId,
    )
  send(msg || discordChannel, message)
}
