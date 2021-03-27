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

describe(`Ship Cargo`, () => {
  it(`should be possible to add cargo to a ship`, async () => {
    await utils.addShip({})
    const guild = game.guilds[0]
    const fuel = guild.ship.cargo.find((c) => c.cargoType === `fuel`)
    const initial = fuel.amount
    guild.ship.addCargo(`fuel`, 1, 0)
    const final = fuel.amount
    chai.expect(initial).to.equal(final - 1)
  })

  it(`should be possible to remove cargo from a ship`, async () => {
    const guild = game.guilds[0]
    const fuel = guild.ship.cargo.find((c) => c.cargoType === `fuel`)
    const initial = fuel.amount
    guild.ship.removeCargo(`fuel`, 1, 0)
    const final = fuel.amount
    chai.expect(initial).to.equal(final + 1)
  })

  it(`should not be possible to remove more cargo from a ship than it is currently carrying`, async () => {
    const guild = game.guilds[0]
    const fuel = guild.ship.cargo.find((c) => c.cargoType === `fuel`)
    fuel.amount = 1
    guild.ship.removeCargo(`fuel`, 2, 0)
    const final = fuel.amount
    chai.expect(final).to.equal(0)
  })

  it(`should spawn a cache on cargo jettison`, async () => {
    const guild = game.guilds[0]
    const fuel = guild.ship.cargo.find((c) => c.cargoType === `fuel`)
    fuel.amount = 1
    guild.ship.jettison(`fuel`, 1, `Hello`)
    assert(game.caches[0])
    chai.expect(game.caches[0].message).to.equal(`Hello`)
  })

  before(async () => {
    try {
      await mongoose.connection.collection(`guilds`).drop()
    } catch (e) {}
    try {
      await mongoose.connection.collection(`ships`).drop()
    } catch (e) {}
    try {
      await mongoose.connection.collection(`caches`).drop()
    } catch (e) {}
    game.guilds = []
    game.caches = []

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
      path.resolve(`./`, `test/output`, `shipCargo.txt`),
      outputToWriteToFile.join(`\n`),
    )
  })
})
