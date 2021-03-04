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
      const testGuild = new models.Guild({ active: false, id: `testGuildId` })
      await testGuild.save()

      const testShip = new models.Ship({ energy: 5 })
      await testShip.save()

      const testUser = new models.User({
        id: `testUserId`,
        activeGuild: `testGuildId`,
      })
      await testUser.save()

      const testCrewMember = new models.CrewMember({ stamina: 0.5 })
      await testCrewMember.save()

      const testCache = new models.Cache({ amount: 1 })
      await testCache.save()

      const testPlanet = new models.Planet({ name: `test` })
      await testPlanet.save()

      assert(true)
    } catch (e) {
      assert.fail(e.message)
    }
  })

  it(`should have guilds, caches, planets, ships, users, crewmembers collections`, async () => {
    collections = (
      await mongoose.connection.db.listCollections().toArray()
    ).map((c) => c.name)
    expect(collections).to.include.all.members([
      `guilds`,
      `caches`,
      `planets`,
      `ships`,
      `users`,
      `crewmembers`,
    ])
  })

  it(`should be able to retrieve a test document from guilds, planets, and caches`, async () => {
    const models = require(`../db/mongo/models`)
    let guild = await models.Guild.findOne()
    expect(guild).to.have.property(`_id`)
    let planet = await models.Planet.findOne()
    expect(planet).to.have.property(`_id`)
    let cache = await models.Cache.findOne()
    expect(cache).to.have.property(`_id`)
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
    await spawnAction({
      msg,
      authorIsAdmin: true,
      client: bot.client,
    })

    const createdGuild = await models.Guild.findOne({
      _id: msg.guild.id,
    })
    assert(createdGuild.id === msg.guild.id)
  })
})


describe(`Guilds Model`, () => {
  it(`should add a ship and guild to the database when creating a new guild, \
      and the guild should have a reference to the shipId`, async () => {
    const game = require(`../game/manager`)

    game.spawn({ discordGuild: msg.guild, channelId: msg.channel.id })
    const createdGuild = await models.Guild.findOne({
      _id: msg.guild.id,
    })
    const createdShip = await models.Ship.findOne({
      guildId: msg.guild.id,
    })
    assert(createdGuild.id === msg.guild.id)
    expect(createdGuild.shipIds).to.contain(createdShip.id)


  })

  it(`should be able to spawn a new user and add a member to a guild`, async () => {
    const { add: addCrewMember } = require(`../db/mongo/crewMembers`)
    const guild = await models.Guild.findOne({ _id: msg.guild.id, })
    assert(guild, `Guild exists`)
    const crewMember = await addCrewMember({
      guildId: guild.id,
      userId: msg.author.id,
      member: { stamina: 0.69 }
    })
    assert(crewMember, `Crew member was created`)
    assert(crewMember.stamina === 0.69, `Crew member was initialized with very nice properties`)
    const user = await models.User.findOne({ _id: msg.author.id, })
    assert(user, `User was created`)
    assert(user.memberships[msg.guild.id] === crewMember.id, `User has link to crew member`)
    assert(guild.members.find((m) => m === crewMember.id), `Ship has link to crew member`)
  })
})

before(async () => {
  const mongoose = require(`mongoose`)
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
  const collections = (await mongoose.connection.db.listCollections().toArray())
  collections.forEach(
    async (c) => await mongoose.connection.collection(c.name).drop(),
  )
  console.log(`    Made sure no collections exist before running tests.\n`)
})

after(async () => {
  const collections = (await mongoose.connection.db.listCollections().toArray())
  collections.forEach(
    async (c) => await mongoose.connection.collection(c.name).drop(),
  )
  console.log(`    Dropped test database collections.\n`)
  await mongoose.disconnect()
  console.log(`Disconnected from mongo.`)
  setTimeout(() => process.exit(), 500) // was beating mocha's output lol
})
