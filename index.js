require(`dotenv`).config()
require(`./globalVariables`)
require(`./db/db`)

const game = require(`./game/manager`)
const bot = require(`./discord/bot`)

bot.init(game)
