require('dotenv').config()

const game = require('./game/manager')
const bot = require('./discord/bot')
const db = require('./db/db')

bot.init(game)
