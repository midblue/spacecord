const mongoose = require(`mongoose`)

let db
let guilds
let caches

let ready = false

const toRun = []

const username = encodeURIComponent(process.env.MONGODB_ADMINUSERNAME)
const password = encodeURIComponent(process.env.MONGODB_ADMINPASSWORD)

const hostname = `mongodb`
const port = 27017
const dbName = `spacecord`

const uri = `mongodb://${username}:${password}@${hostname}:${port}\
/${dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })


db = mongoose.connection
db.on(`error`, console.error.bind(console, `connection error`))
db.once(`open`, () => {
  console.log(`we did it! :) :D `)
  ready = true

  guilds = require(`./guilds`)(db)
  console.log(`in db.js - guilds = `)
  console.log(guilds)
  caches = require(`./caches`)(db)
  console.log(`in db.js - caches = `)
  console.log(caches)
  toRun.forEach((f) => f({
    db,
    guilds,
    caches,
    runOnReady
  }))
})

const runOnReady = (f) => {
  if (ready) {
    f({
      db,
      guilds,
      caches,
      runOnReady
    })
  }
  else {
    toRun.push(f)
  }
}


module.exports = {
  db,
  guilds,
  caches,
  runOnReady
}
