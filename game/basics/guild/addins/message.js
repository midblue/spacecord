const pushToGuild = require(`../../../../discord/actions/pushToGuild`)

module.exports = (guild) => {
  const p2g = async (message, discordMsgObject, awaitReactionOptions) => {
    if (awaitReactionOptions && !awaitReactionOptions.reactions)
      awaitReactionOptions = { reactions: awaitReactionOptions }

    return await pushToGuild({
      id: guild.id,
      channelId: guild.channel,
      msg: discordMsgObject,
      message,
      awaitReactionOptions,
    })
  }

  guild.message = p2g

  guild.ship.message = p2g
}
