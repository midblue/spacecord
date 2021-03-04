const pushToGuild = require(`../../../../discord/actions/pushToGuild`)

module.exports = (guild) => {
  const p2g = async (
    message,
    discordMsgOject,
    reactions,
  ) => {
    await pushToGuild({
      id: guild.id,
      channelId: guild.channel,
      msg: discordMsgOject,
      message,
      reactions,
    })
  }

  guild.pushToGuild = p2g

  guild.ship.pushToGuild = p2g
}
