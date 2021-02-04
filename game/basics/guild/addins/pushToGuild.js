const pushToGuild = require('../../../../discord/actions/pushToGuild')

module.exports = (guild) => {
  guild.pushToGuild = async (message, discordMsgOject) => {
    await pushToGuild({
      guildId: guild.guildId,
      channelId: guild.channel,
      msg: discordMsgOject,
      message,
    })
  }
}
