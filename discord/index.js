const { ShardingManager } = require(`discord.js-light`)
const manager = new ShardingManager(`./discord/bot.js`, {
  token: process.env.DISCORD_TOKEN,
})

manager.on(`shardCreate`, (shard) => {
  console.log(`Launched shard ${shard.id}`)
})

manager.spawn()
