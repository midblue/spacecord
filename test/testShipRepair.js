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

describe(`Ship Repair`, () => {
  it(`should use engine durability on thrust`, async () => {
    const ship1 = await utils.addShip({
      location: [1, 1],
      status: { docked: false, dead: false },
    })
    const ship2 = await utils.addShip(
      {
        location: [1.00001, 1.00001],
        status: { docked: false, dead: false },
      },
      true,
    )
    ship1.equipment.find((e) => e.equipmentType === `weapon`).list = []
    ship1.addPart(equipment.weapon.debugAlwaysHit1)
    assert(false, `tompkins`)
  })

  it(`should use telemetry durability on scan`)

  it(`should use battery durability on scan`)

  it(`should use ship scanner durability on ship scan`)

  it(`should use transceiver durability on broadcast`)

  it(`should use weapon durability on attack`)

  it(`should be possible to repair equipment`)

  it(`should not be possible to repair equipment above 100%`)

  it(`should not be possible to use a broken engine`)

  it(`should not be possible to use a broken telemetry system`)

  it(`should not be possible to use a broken battery`)

  it(`should not be possible to use a broken ship scanner`)

  it(`should not be possible to use a broken transceiver`)

  it(`should not be possible to use a broken weapon`)

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
      path.resolve(`./`, `test/output`, `shipRepair.txt`),
      outputToWriteToFile.join(`\n`),
    )
  })
})
