require(`dotenv`).config()
require(`./globalVariables`)
const { db, init: initDb, runOnReady: runOnDbReady } = require(`./db/mongo/db`)
require(`./api`)
require(`./imageGen/htmlGenerator/buildTemplates`)

const game = require(`./game/manager`)
const bot = require(`./discord/bot`)

initDb({})

runOnDbReady(() => {
  game.init(db)
  bot.init(game)
})
