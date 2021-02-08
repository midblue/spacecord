const pushToGuild = require('../../../../discord/actions/pushToGuild')

module.exports = (guild) => {
  guild.pushToGuild = guild.ship.pushToGuild = async (
    message,
    discordMsgOject,
    reactions,
  ) => {
    await pushToGuild({
      guildId: guild.guildId,
      channelId: guild.channel,
      msg: discordMsgOject,
      message,
      reactions,
    })
  }
}
