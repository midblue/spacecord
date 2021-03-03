require(`dotenv`).config()
require(`../globalVariables`)
const assert = require(`assert`)
const { expect } = require(`chai`)
const mongoose = require(`mongoose`)
const { init: initDb, db } = require(`../db/mongo/db`)
const { msg } = require(`./tools/messages`)
const models = require(`../db/mongo/models`)

describe(`Database`, () => {
  it(`should create a mongoose connection to mongo successfully`, async () => {
    assert(mongoose.connection.readyState === 1) // connected
  })

  it(`should be able to add data to each model`, async () => {
    
    try {
      const testGuild = new models.Guild({ active: false })
      await testGuild.save()

      const testCache = new models.Cache({ amount: 1 })
      await testCache.save()

      const testPlanet = new models.Planet({ name: `test` })
      await testPlanet.save()

      assert(true)
    }
    catch (e) {
      assert.fail(false, true, e.message)
    }
  })

  it(`should have guilds, caches, plagnets collections`, async () => {
    collections = (await mongoose.connection.db.listCollections().toArray()).map((c) => c.name)
    expect(collections)
      .to.include.all.members([`guilds`, `caches`, `planets`])
    
    //   expect(res.body)
    // .to.be.an.instanceof(Array)
    // .and.to.have.property(0)
    // .that.includes.all.keys([ 'id', 'category', 'tenant' ])

    // expect(res)
    // .to.have.nested.property('body[0]')
    // .that.includes.all.keys([ 'id', 'category', 'tenant' ])
  })

  it(`should be able to retrieve a test document from guilds, planets, and caches`, async () => {
    const models = require(`../db/mongo/models`)
    let guild = await models.Guild.findOne()
    expect(guild)
      .to.have.property(`_id`)
    let planet = await models.Planet.findOne()
    expect(planet)
      .to.have.property(`_id`)
    let cache = await models.Cache.findOne()
    expect(cache)
      .to.have.property(`_id`)
  })

  it(`should be able to initialize the game`, async () => {
    const { runOnReady, init: initDb, db } = require(`../db/mongo/db`)
    runOnReady(async () => {
      assert(true, `Db is ready`)

      const game = require(`../game/manager`)
      await game.init(db)
      assert(game.isReady, `Game is ready`)

      const bot = require(`../discord/bot`)
      await bot.init(game)
      assert(bot.client.isReady, `Bot is ready`)
    })
    await initDb({})

  })

  it(`should create a new guild when running bot.spawn()`, async () => {
    const spawnAction = require(`../discord/commands/spawn`).action
    const bot = require(`../discord/bot`)
    await spawnAction({ msg, authorIsAdmin: true, client: bot.client })
    
    const createdGuild = await models.Guild.findOne({ guildId: msg.guild.id })
    assert(createdGuild.guildId === msg.guild.id)
  })
})


before(async () => {
  const mongoose = require(`mongoose`)
  const hostname = `127.0.0.1`
  const port = 27017
  const dbName = `spacecord-test`
  const username = encodeURIComponent(`testuser`)
  const password = encodeURIComponent(`testpass`)
 
  await initDb({ hostname, port, dbName, username, password });

  (await mongoose.connection.db.listCollections().toArray())
    .forEach(
      async (c) => await mongoose.connection.collection(c.name).drop()
    )
  console.log(`    Made sure no collections exist before running tests.\n`)
})

after(async () => {
  (await mongoose.connection.db.listCollections().toArray())
    .forEach(
      async (c) => await mongoose.connection.collection(c.name).drop()
    )
  console.log(`    Dropped test database collections.\n`)
  await mongoose.disconnect()
  console.log(`Disconnected from mongo.`)
})
