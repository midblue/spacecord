const fs = require(`fs`)
const path = require(`path`)
const assert = require(`assert`)
const chai = require(`chai`)
const mongoose = require(`mongoose`)
const { msg } = require(`./tools/messages`)
const models = require(`../db/mongo/models`)
const chaiAlmost = require(`chai-almost`)
chai.use(chaiAlmost())
const utils = require(`./tools/utils`)
const game = require(`../game/manager`)
const equipment = require(`../game/basics/equipment/equipment`)

let outputToWriteToFile = []

describe(`Ship Broadcast`, () => {
  it(`should be received by guilds in range when a broadcast is sent`, async () => {
    game.planets = []
    await utils.addShip({ location: [1, 1], status: { dead: false, docked: false } })
    await utils.addShip({ location: [1.001, 1.001], status: { dead: false, docked: false } })
    const guild1 = game.guilds[0]
    const { receivedGuilds } = guild1.ship.broadcast({
      broadcastType: `distress`,
      equipment: equipment.transceiver.transceiver1,
      yesPercent: 1,
      collectiveSkill: 1,
    })
    chai.expect(receivedGuilds.length).to.equal(1)
  })

  it(`should not be received by guilds outside of range when a broadcast is sent`, async () => {
    game.planets = []
    utils.addShip({ location: [1, 1] })
    utils.addShip({ location: [1000, 1000] })
    const guild1 = game.guilds[0]
    const { receivedGuilds } = guild1.ship.broadcast({
      broadcastType: `distress`,
      equipment: equipment.transceiver.transceiver2,
      yesPercent: 1,
      collectiveSkill: 1,
    })
    chai.expect(receivedGuilds.length).to.equal(0)
  })

  before(async () => {
    try {
      await mongoose.connection.collection(`guilds`).drop()
    } catch (e) { }
    try {
      await mongoose.connection.collection(`ships`).drop()
    } catch (e) { }
    try {
      await mongoose.connection.collection(`users`).drop()
    } catch (e) { }
    game.guilds = []

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
      path.resolve(`./`, `test/output`, `shipBroadcast.txt`),
      outputToWriteToFile.join(`\n`),
    )
  })
})
