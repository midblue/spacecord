const client = require('../bot').client
const commands = require('../commands/index').commands
const defaultServerSettings = require('../defaults/defaultServerSettings')

module.exports = async ({ guildId, channelId, commandTag, props }) => {
  const discordGuild = await client.guilds.fetch(guildId)
  const discordChannel = await discordGuild.channels.cache
    .array()
    .find((channel) => channel.type === 'text' && channel.id === channelId)
  for (let command of commands)
    if (command.tag === commandTag)
      command.action({
        msg: discordChannel,
        settings: defaultServerSettings,
        client,
        ...props,
      })
}
