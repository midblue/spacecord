require('dotenv').config()
// require('events').EventEmitter.prototype._maxListeners = 5000

require('./db/db')

const game = require('./game/manager')
const bot = require('./discord/bot')

bot.init(game)
