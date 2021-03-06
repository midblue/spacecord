const fs = require(`fs`)
const path = require(`path`)
const assert = require(`assert`)
const { expect } = require(`chai`)
const mongoose = require(`mongoose`)
const { msg } = require(`./tools/messages`)
const models = require(`../db/mongo/models`)
const { db, runOnReady, init: initDb } = require(`../db/mongo/db`)
const game = require(`../game/manager`)

let outputToWriteToFile = []

describe(`Database`, () => {
  it(`should create a mongoose connection to mongo successfully`, async () => {
    assert(mongoose.connection.readyState === 1) // connected
  })

  it(`should be able to add data to each model`, async () => {
    const guilds = require(`../db/mongo/guild`)
    await guilds.add({ id: msg.guild.id, data: { active: false } })

    const ships = require(`../db/mongo/ship`)
    await ships.add({ guildId: msg.guild.id, data: { energy: 5 } })

    const users = require(`../db/mongo/user`)
    await users.add({ id: msg.author.id })

    const crewMembers = require(`../db/mongo/crewMember`)
    await crewMembers.add({
      guildId: msg.guild.id,
      userId: msg.author.id,
      member: { stamina: 0.5 },
    })

    const caches = require(`../db/mongo/cache`)
    await caches.add({ amount: 1 })

    const attackRemnants = require(`../db/mongo/attackRemnant`)
    await attackRemnants.add({ didHit: true })

    const planets = require(`../db/mongo/planet`)
    await planets.add({ name: `test` })

    assert(true)
  })

  it(`should have guilds, caches, planets, ships, users, crewmembers, attackremnants collections`, async () => {
    const collections = (
      await mongoose.connection.db.listCollections().toArray()
    ).map((c) => c.name)
    expect(collections).to.include.all.members([
      `guilds`,
      `caches`,
      `planets`,
      `ships`,
      `users`,
      `crewmembers`,
      `attackremnants`,
    ])
  })

  it(`should be able to retrieve a test document from guilds, planets, attackRemnants, and caches`, async () => {
    const models = require(`../db/mongo/models`)
    let guild = await models.Guild.findOne()
    expect(guild).to.have.property(`id`)
    let planet = await models.Planet.findOne()
    expect(planet).to.have.property(`id`)
    let cache = await models.Cache.findOne()
    expect(cache).to.have.property(`id`)
    let attackRemnant = await models.AttackRemnant.findOne()
    expect(attackRemnant).to.have.property(`id`)

    // clean up
    const collections = await mongoose.connection.db.listCollections().toArray()
    for (let c of collections)
      await mongoose.connection.collection(c.name).drop()
  })

  before(() => {
    console.log = (...args) => {
      outputToWriteToFile.push(
        args.map((a) =>
          typeof a === `object` ? JSON.stringify(a, null, 2) : a,
        ),
      )
    }
  })

  after(() => {
    fs.writeFileSync(
      path.resolve(`./`, `test/output`, `database.txt`),
      outputToWriteToFile.join(`\n`),
    )
  })
})

describe(`Game Start`, () => {
  it(`should be able to initialize the db`, async () => {
    return new Promise(async (resolve) => {
      runOnReady(async () => {
        assert(true, `Db is ready`)
        resolve()
      })
      await initDb({})
    })
  })

  it(`should be able to initialize the game`, async () => {
    await game.init(db)
    assert(game.isReady, `Game is ready`)
    assert(game.gameDiameter() > 0)
  })

  it(`should be able to initialize the discord bot & connect to discord`, async function () {
    this.timeout(15000)
    const bot = require(`../discord/bot`)
    await bot.init(game)
    assert(bot.client.readyAt, `Bot is ready`)
  })
})

describe(`Base Data Initialization & Updates`, () => {
  it(`should create a new guild when running game.spawn()`, async () => {
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
    assert(createdGuild)
  })

  it(`should also create a user, crewMember, and ship when creating a new guild, and all references should be correct`, async () => {
    const createdGuild = await models.Guild.findOne({
      _id: msg.guild.id,
    })
    assert(createdGuild)
    assert(createdGuild.id === msg.guild.id)
    expect(Object.keys(createdGuild.members).length).to.equal(1)

    const createdShip = await models.Ship.findOne({
      guildId: msg.guild.id,
    })
    assert(createdShip)
    assert(createdShip.guildId === msg.guild.id)
    expect(createdGuild.shipIds).to.contain(createdShip.id)

    const createdUser = await models.User.findOne({
      _id: createdGuild.members[0].userId,
    })
    assert(createdUser)
    assert(createdUser.memberships.length)
    assert(createdUser.memberships.find((m) => m.guildId === msg.guild.id))

    const createdCrewMember = await models.CrewMember.findOne({
      _id: createdUser.memberships.find((m) => m.guildId === msg.guild.id)
        .crewMemberId,
    })
    assert(createdCrewMember)
    assert(createdCrewMember.userId === createdUser.id)
  })

  it(`should be able to spawn a new user and add a member to a guild, and all references should be correct`, async () => {
    const gameGuild = (await game.guild(msg.guild.id)).guild

    const { crewMember } = await gameGuild.ship.addCrewMember({
      id: `secondUserId`,
      nickname: `secondUser`,
    })
    assert(crewMember, `Crew member was created`)
    expect(crewMember.stamina).to.equal(
      1,
      `Crew member was initialized with default properties`,
    )

    guild = await models.Guild.findOne({ _id: msg.guild.id }) // get it again because it doesn't live update with the new crew member
    expect(guild.members.length).to.equal(2, `Two crew members exist`)

    const user = await models.User.findOne({ _id: `secondUserId` })
    assert(user, `User was created`)

    assert(
      user.memberships.find(
        (m) =>
          m.guildId === guild.id && m.crewMemberId === crewMember.crewMemberId,
      ),
      `User has link to crew member and guild`,
    )

    assert(
      guild.members.find((m) => m.userId === user.id).crewMemberId ===
        crewMember.crewMemberId,
      `Guild has link to crew member and user`,
    )

    assert(crewMember.id === user.id)
    assert(crewMember.guildId === guild.id)
  })

  it(`should have the correct properties saved on equipment and cargo`, async () => {
    const gameGuild = (await game.guild(msg.guild.id)).guild

    console.log(gameGuild.ship.equipment[0])
    assert(gameGuild.ship.equipment[0])
    expect(gameGuild.ship.equipment[0]).to.have.property(`equipmentType`)
    expect(gameGuild.ship.equipment[0]).to.have.property(`list`)
    expect(gameGuild.ship.equipment[0].list[0]).to.have.property(`id`)
    expect(gameGuild.ship.equipment[0].list[0]).to.have.property(`repair`)
    expect(gameGuild.ship.equipment[0].list[0]).to.have.property(`repaired`)
    expect(gameGuild.ship.equipment[0].list[0]).to.have.property(`displayName`)

    assert(gameGuild.ship.cargo[0])
    expect(gameGuild.ship.cargo[0]).to.have.property(`cargoType`)
    expect(gameGuild.ship.cargo[0]).to.have.property(`amount`)
    expect(gameGuild.ship.cargo[0]).to.have.property(`emoji`)
  })

  it(`should be able to save data updates to the guild and ship`, async () => {
    const gameGuild = (await game.guild(msg.guild.id)).guild

    gameGuild.name = `The Whizzard's Palace`
    gameGuild.ship.status.docked = ``

    await gameGuild.saveToDb()
    assert(`could save guild`)

    const dbGuild = await models.Guild.findOne({ _id: gameGuild.id })
    expect(dbGuild.name).to.equal(`The Whizzard's Palace`)

    const dbShip = await models.Ship.findOne({ _id: dbGuild.shipIds[0] })
    expect(dbShip.status.docked).to.equal(``)
  })

  it(`should be able to save data updates to the cargo and equipment`, async () => {
    const gameGuild = (await game.guild(msg.guild.id)).guild

    gameGuild.ship.cargo.find((c) => c.cargoType === `fuel`).amount = 69
    gameGuild.ship.equipment.find(
      (e) => e.equipmentType === `weapon`,
    ).list[0].repair = 0.69
    await gameGuild.saveToDb()

    const dbShip = await models.Ship.findOne({ guildId: gameGuild.id })
    expect(dbShip.cargo.find((c) => c.cargoType === `fuel`).amount).to.equal(69)
    expect(
      dbShip.equipment.find((e) => e.equipmentType === `weapon`).list[0].repair,
    ).to.equal(0.69)
  })

  before(() => {
    console.log = (...args) => {
      outputToWriteToFile.push(
        args.map((a) =>
          typeof a === `object` ? JSON.stringify(a, null, 2) : a,
        ),
      )
    }
  })

  after(() => {
    fs.writeFileSync(
      path.resolve(`./`, `test/output`, `gameStart.txt`),
      outputToWriteToFile.join(`\n`),
    )
  })
})

// describe(`Gameplay`, () => {
//   it(`should x y z`, async () => {
//     assert(true)
//   })
// })

// describe(`Gameplay`, () => {
//   it(`should x y z`, async () => {
//     assert(true)
//   })
// })
