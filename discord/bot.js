const Discord = require('discord.js-light')
const client = new Discord.Client({
  cacheGuilds: true,
  cacheChannels: false,
  cacheOverwrites: false,
  cacheRoles: false,
  cacheEmojis: false,
  cachePresences: false,
  restTimeOffset: 0,
  messageCacheMaxSize: 2,
  messageCacheLifetime: 30,
  messageSweepInterval: 60,
  disabledEvents: [
    'GUILD_ROLE_CREATE',
    'GUILD_ROLE_DELETE',
    'GUILD_ROLE_UPDATE',
    'GUILD_BAN_ADD',
    'GUILD_BAN_REMOVE',
    'GUILD_EMOJIS_UPDATE',
    'GUILD_INTEGRATIONS_UPDATE',
    'CHANNEL_PINS_UPDATE',
    'PRESENCE_UPDATE',
    'TYPING_START',
    'TYPING_END',
    'VOICE_STATE_UPDATE',
    'VOICE_SERVER_UPDATE',
  ],
})

const privateMessage = require('./events/privateMessage')
const guildMessage = require('./events/guildMessage')
const kickedFromGuild = require('./events/kickedFromGuild')
const addedToGuild = require('./events/addedToGuild')

client.on('error', (e) => console.log('Discord.js error:', e.message))
client.on('ready', async () => {
  console.log(
    `Logged in as ${client.user.tag} in ${
      (await client.guilds.cache.array()).length
    } guilds`,
  )
  client.user.setActivity('.help', { type: 'LISTENING' })
  client.game.verifyActiveGuilds(await client.guilds.cache.array())
})

// added to a server
client.on('guildCreate', addedToGuild)

// removed from a server
client.on('guildDelete', kickedFromGuild)

// other user leaves a guild
// client.on('guildMemberRemove', otherMemberLeaveServer)

client.login(process.env.DISCORD_TOKEN)

module.exports = {
  init(gameController) {
    client.game = gameController

    client.on('message', async (msg) => {
      if (!msg.author || msg.author.bot) return
      if (!msg.guild || !msg.guild.available) return privateMessage(msg)
      return guildMessage({ msg, client, game: gameController })
    })

    client.on('raw', async (event) => {
      this.rawWatchers.forEach((handler) => handler(event))
    })
  },
  client,
  rawWatchers: [],
}
