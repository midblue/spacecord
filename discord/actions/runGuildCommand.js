const client = require(`../bot`).client
const { log } = require(`../botcommon`)
const { test } = require(`../commands`)

module.exports = async ({
  guildId,
  channelId,
  commandTag,
  author,
  props,
  msg
}) => {
  let fakeMsg
  if (!msg) {
    const discordGuild = await client.guilds.fetch(guildId)
    const discordChannel = await discordGuild.channels.cache
      .array()
      .find((channel) => channel.type === `text` && channel.id === channelId)
    fakeMsg = { guild: discordGuild, channel: discordChannel, author }
  }

  test({
    msg: msg || fakeMsg,
    client,
    predeterminedCommandTag: commandTag,
    props
  })
}
