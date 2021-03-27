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

describe(`Ship Combat`, () => {
  it(`should be able to hit a ship within range`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship
  })

  it(`should always miss a ship outside of range`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship
  })

  it(`should take equipment damage on being hit by an attack`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship
  })

  it(`should take the right amount of damage on being hit by an attack`)

  it(
    `should deal cascading damage to other equipment on destroying the first piece`,
  )

  it(`should use ship armor first to mitigate damage taken`)

  it(`should take less damage to ship armor than other equipment`)

  it(`should be possible to target a specific piece of equipment on a ship`)

  it(`should destroy the ship on its reaching 0 hp`)

  it(`should jettison all of the ship's cargo on death, scaled by a percentage`)

  it(`should spawn an attack remnant on each attack`)

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
    game.planets = []
    const ship1 = await utils.addShip({
      location: [1, 1],
      status: { docked: false, dead: false },
    })
    const ship2 = await utils.addShip({
      location: [1.00001, 1.00001],
      status: { docked: false, dead: false },
    })
    ship1.equipment.find((eq) => eq.equipmentType === `weapon`).list = [
      equipment.weapon.debugAlwaysHit1,
    ]
    ship2.equipment.find((eq) => eq.equipmentType === `weapon`).list = [
      equipment.weapon.debugAlwaysMiss,
    ]

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
      path.resolve(`./`, `test/output`, `shipCombat.txt`),
      outputToWriteToFile.join(`\n`),
    )
  })
})
