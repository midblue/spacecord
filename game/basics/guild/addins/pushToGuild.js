const pushToGuild = require(`../../../../discord/actions/pushToGuild`)


module.exports = (guild) => {
  const p2g = async (
    message,
    discordMsgOject,
    reactions
  ) => {
    await pushToGuild({
      guildId: guild.guildId,
      channelId: guild.channel,
      msg: discordMsgOject,
      message,
      reactions
    })
  }

  guild.pushToGuild = p2g

  guild.ship.pushToGuild = p2g
}
