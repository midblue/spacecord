const pushToGuild = require('../../../../discord/actions/pushToGuild')

module.exports = (guild) => {
  guild.pushToGuild = async (message) => {
    await pushToGuild({
      guildId: guild.guildId,
      channelId: guild.channel,
      client: guild.client,
      message,
    })
  }
}
