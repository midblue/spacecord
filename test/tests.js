require(`dotenv`).config()
require(`../globalVariables`)
const mongoose = require(`mongoose`)
const { init: initDb, db } = require(`../db/mongo/db`)
const savedConsoleLogRef = console.log

// ******* test order ********

require(`./testGameSetup.js`)
require(`./testGravity.js`)
require(`./testCoreLoop.js`)
require(`./testPlanets.js`)
require(`./testCaches.js`)
require(`./testAttackRemnants.js`)
require(`./testShipEquipment.js`)
require(`./testShipRepair.js`)
require(`./testShipCargo.js`)
require(`./testShipCombat.js`)
require(`./testShipMotion.js`)
require(`./testShipPower.js`)
require(`./testShipBroadcast.js`)
require(`./testMemberSkills.js`)
require(`./testMemberStamina.js`)

before(async () => {
  const hostname = `127.0.0.1`
  const port = 27017
  const dbName = `spacecord-test`
  const username = encodeURIComponent(`testuser`)
  const password = encodeURIComponent(`testpass`)

  await initDb({
    hostname,
    port,
    dbName,
    username,
    password,
  })
  const collections = await mongoose.connection.db.listCollections().toArray()
  collections.forEach(
    async (c) => await mongoose.connection.collection(c.name).drop(),
  )
  console.log(`    Made sure no collections exist before running tests.\n`)
})

after(async () => {
  console.log = savedConsoleLogRef

  const collections = await mongoose.connection.db.listCollections().toArray()
  collections.forEach(
    async (c) => await mongoose.connection.collection(c.name).drop(),
  )
  console.log(`    Dropped test database collections.\n`)
  await mongoose.disconnect()
  console.log(`    Disconnected from mongo.`)
  setTimeout(() => process.exit(), 500) // was beating mocha's output lol
})
