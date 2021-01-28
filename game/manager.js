const guild = require('./guild')
const items = require('./basics/items')
const ships = require('./basics/ships')

const discordGuild = { name: 'the heroes', id: 1234 }
const myGuild = guild.spawn(discordGuild)

console.log(myGuild)
