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

let outputToWriteToFile = []

describe(`Ship Broadcast`, () => {
  it(`should be received by guilds in range when a broadcast is sent`, async () => {
    game.planets = []
    utils.addShip({ location: [1, 1] })
    utils.addShip({ location: [1.00001, 1.00001] })

    const guild1 = game.guilds[0]
    guild1.ship.broadcast()

    assert(false, `Tony Kong <(B{|)`)
  })

  it(`should not be received by guilds outside of range when a broadcast is sent`, async () => {
    assert(false, `Tony Kong <(B{|)`)
  })

  before(async () => {
    try {
      await mongoose.connection.collection(`guilds`).drop()
      await mongoose.connection.collection(`ships`).drop()
      await mongoose.connection.collection(`users`).drop()
      game.guilds = []
    } catch (e) {}

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
