const client = require(`../bot`).client
const { log } = require(`../botcommon`)
const { test } = require(`../commands`)

module.exports = async ({
  id,
  channelId,
  commandTag,
  author,
  props,
  msg,
  guild,
}) => {
  let fakeMsg
  if (!msg) {
    if (guild) {
      id = guild.id
      channelId = guild.channel
    }
    const discordGuild = await client.guilds.fetch(id)
    const discordChannel = await discordGuild.channels.fetch(channelId)
    fakeMsg = {
      guild: discordGuild,
      channel: discordChannel,
      author,
    }
  }

  test({
    msg: msg || fakeMsg,
    client,
    predeterminedCommandTag: commandTag,
    props,
    system: !author,
  })
}
