const send = require('./send')

module.exports = async ({ guildId, channelId, client, message }) => {
  const discordGuild = await client.guilds.fetch(guildId)
  const discordChannel = await discordGuild.channels.cache
    .array()
    .find((channel) => channel.type === 'text' && channel.id === channelId)
  send(discordChannel, message)
}
