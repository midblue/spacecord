const client = require('../bot').client
const { log } = require('../botcommon')
const { test } = require('../commands/index')

module.exports = async ({ guildId, channelId, commandTag, author, props }) => {
  const discordGuild = await client.guilds.fetch(guildId)
  const discordChannel = await discordGuild.channels.cache
    .array()
    .find((channel) => channel.type === 'text' && channel.id === channelId)
  const msg = { guild: discordGuild, channel: discordChannel, author }
  // console.log(author, msg, props)

  test({
    msg,
    client,
    predeterminedCommandTag: commandTag,
    props,
  })

  // for (let command of commands)
  //   if (command.tag === commandTag) {
  //     didFindCommand = true
  //     log(discordChannel, command.tag + ' (triggered)', discordGuild.name)
  //     command.action({
  //       msg: discordChannel,
  //       settings: defaultServerSettings,
  //       client,
  //       ...props,
  //     })
  //   }
}
