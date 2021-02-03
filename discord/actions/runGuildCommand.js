const client = require('../bot').client
const { log } = require('../botcommon')
const { test } = require('../commands/index')

module.exports = async ({
  guildId,
  channelId,
  commandTag,
  author,
  props,
  msg,
}) => {
  const discordGuild = await client.guilds.fetch(guildId)
  const discordChannel = await discordGuild.channels.cache
    .array()
    .find((channel) => channel.type === 'text' && channel.id === channelId)
  const fakeMsg = { guild: discordGuild, channel: discordChannel, author }
  // console.log(author, msg, props)

  test({
    msg: msg || fakeMsg,
    client,
    predeterminedCommandTag: commandTag,
    props,
  })
}
