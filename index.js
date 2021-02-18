require(`dotenv`).config()
require(`./globalVariables`)
require(`./db/db`)

// require('events').EventEmitter.prototype._maxListeners = 5000

const game = require(`./game/manager`)
const bot = require(`./discord/bot`)

bot.init(game)

