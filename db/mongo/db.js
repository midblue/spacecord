const mongoose = require(`mongoose`)
const routes = {
  guild: require(`./guild`),
  cache: require(`./cache`),
  ship: require(`./ship`),
  user: require(`./user`),
  crewMember: require(`./crewMember`),
}
let ready = false
const toRun = []

const init = ({
  hostname = `mongodb`,
  port = 27017,
  dbName = `spacecord`,
  username = encodeURIComponent(process.env.MONGODB_ADMINUSERNAME),
  password = encodeURIComponent(process.env.MONGODB_ADMINPASSWORD),
}) => {
  return new Promise(async (resolve) => {
    if (ready) resolve()

    const setup = async () => {
      // console.log(`setup`)
      ready = true
      const promises = toRun.map(async (f) => await f())
      await Promise.all(promises)
      resolve()
    }

    if (mongoose.connection.readyState == 0) {
      const uri = `mongodb://${username}:${password}@${hostname}:${port}/${dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`
      // console.log(`No existing db connection, creating with`, uri)

      mongoose
        .connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
        })
        .catch((error) => console.log(error))

      mongoose.connection.on(`error`, (error) => console.log(error))
      mongoose.connection.once(`open`, () => {
        setup()
      })
    } else {
      // console.log(`Running with existing db connection`)
      setup()
    }
  })
}

const runOnReady = (f) => {
  if (ready) f()
  else toRun.push(f)
}

module.exports = {
  init,
  db: routes,
  runOnReady,
}
