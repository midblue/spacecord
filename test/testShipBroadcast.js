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
    await utils.addShip({
      location: [1, 1],
      status: { dead: false, docked: false },
    })
    await utils.addShip(
      { location: [1.001, 1.001], status: { dead: false, docked: false } },
      true,
    )
    const guild1 = game.guilds[0]
    guild1.ship.power = 1000
    guild1.ship.addPart(equipment.transceiver.transceiver1, 0)
    const transceiver = guild1.ship.equipment.find(
      (e) => e.equipmentType === `transceiver`,
    ).list[0]
    const res = guild1.ship.broadcast({
      broadcastType: `distress`,
      equipment: transceiver,
      yesPercent: 1,
      collectiveSkill: 1,
    })
    chai.expect(res.receivedGuilds.length).to.equal(1)
  })

  it(`should not be received by guilds outside of range when a broadcast is sent`, async () => {
    const guild1 = game.guilds[0],
      guild2 = game.guilds[1]
    guild2.ship.location = [3, 3]
    guild1.ship.power = 1000
    const transceiver = guild1.ship.equipment.find(
      (e) => e.equipmentType === `transceiver`,
    ).list[0]
    const res = guild1.ship.broadcast({
      broadcastType: `distress`,
      equipment: transceiver,
      yesPercent: 1,
      collectiveSkill: 1,
    })
    chai.expect(res.receivedGuilds.length).to.equal(0)
  })

  before(async () => {
    try {
      await mongoose.connection.collection(`guilds`).drop()
    } catch (e) {}
    try {
      await mongoose.connection.collection(`ships`).drop()
    } catch (e) {}
    try {
      await mongoose.connection.collection(`users`).drop()
    } catch (e) {}
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
