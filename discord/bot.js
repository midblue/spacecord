module.exports = function (gameController) {
  const Discord = require('discord.js')
  const client = new Discord.Client({
    messageCacheMaxSize: 2,
    messageCacheLifetime: 30,
    messageSweepInterval: 60,
    disabledEvents: [
      // 'GUILD_ROLE_CREATE',
      // 'GUILD_ROLE_DELETE',
      // 'GUILD_ROLE_UPDATE',
      'GUILD_BAN_ADD',
      'GUILD_BAN_REMOVE',
      'GUILD_EMOJIS_UPDATE',
      'GUILD_INTEGRATIONS_UPDATE',
      'CHANNEL_PINS_UPDATE',
      'PRESENCE_UPDATE',
      'TYPING_START',
      'VOICE_STATE_UPDATE',
      'VOICE_SERVER_UPDATE',
    ],
  })

  const privateMessage = require('./events/privateMessage')
  const guildMessage = require('./events/guildMessage')

  client.game = gameController

  client.on('error', (e) => console.log('Discord.js error:', e.message))
  client.on('ready', async () => {
    console.log(
      `Logged in as ${client.user.tag} in ${
        (await client.guilds.cache.array()).length
      } guilds`,
    )
    // client.user.setActivity('t!info', { type: 'LISTENING' })
  })

  client.on('message', async (msg) => {
    if (!msg.author || msg.author.bot) return
    if (!msg.guild || !msg.guild.available) return privateMessage(msg)
    return guildMessage({ msg, client, game: gameController })
  })

  // added to a server
  // client.on('guildCreate', addedToServer)

  // removed from a server
  // client.on('guildDelete', kickedFromServer)

  // other user leaves a guild
  // client.on('guildMemberRemove', otherMemberLeaveServer)

  client.login(process.env.DISCORD_TOKEN)
}
