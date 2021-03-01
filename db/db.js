const mongoose = require(`mongoose`)

const hostname = `mongodb`
const port = 27017
const dbName = `spacecord`

let ready = false
const toRun = []

const username = encodeURIComponent(process.env.MONGODB_ADMINUSERNAME)
const password = encodeURIComponent(process.env.MONGODB_ADMINPASSWORD)

const uri = `mongodb://${username}:${password}@${hostname}:${port}\
/${dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
const routes = {}

db.on(`error`, console.error.bind(console, `connection error`))
db.once(`open`, () => {
  routes.guilds = require(`./guilds`)(db)

  routes.caches = require(`./caches`)(db)

  ready = true

  toRun.forEach((f) => f())
})

const runOnReady = (f) => {
  if (ready)
    f()
  else
    toRun.push(f)
}

module.exports = {
  db: routes,
  runOnReady
}
