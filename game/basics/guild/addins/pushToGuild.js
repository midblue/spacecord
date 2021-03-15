const pushToGuild = require(`../../../../discord/actions/pushToGuild`)

module.exports = (guild) => {
  const p2g = async (message, discordMsgObject, reactions) => {
    return await pushToGuild({
      id: guild.id,
      channelId: guild.channel,
      msg: discordMsgObject,
      message,
      reactions,
    })
  }

  guild.message = p2g

  guild.ship.message = p2g
}
