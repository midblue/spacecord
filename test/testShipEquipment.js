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
const { equipment } = require(`../game/basics/equipment/equipment`)

let outputToWriteToFile = []

describe(`Ship Equipment`, () => {
  it(`should have live properties on ship equipment`, async () => {
    await utils.addShip({})
    const guild = game.guilds[0]
    const chassis = guild.ship.equipment.find(
      (e) => e.equipmentType === `chassis`,
    ).list[0]
    assert(chassis.displayName)
  })

  it(`should be possible to sell equipment, and to get credits for selling`, async () => {
    const guild = game.guilds[0]
    const telemetry = guild.ship.equipment.find(
      (e) => e.equipmentType === `telemetry`,
    ).list[0]
    assert(telemetry)
    const initialCredits = guild.ship.credits
    guild.ship.removePart(telemetry, 1)
    const finalCredits = guild.ship.credits
    chai.expect(finalCredits).to.equal(initialCredits + 1)
    const finalTelemetry = guild.ship.equipment.find(
      (e) => e.equipmentType === `telemetry`,
    ).list[0]
    assert(!finalTelemetry)
  })

  it(`should be possible to buy equipment, and to spend credits on it`, async () => {
    const guild = game.guilds[0]
    const telemetry = guild.ship.equipment.find(
      (e) => e.equipmentType === `telemetry`,
    ).list[0]
    assert(!telemetry)
    guild.ship.credits = 2
    const initialCredits = guild.ship.credits
    guild.ship.addPart(equipment.telemetry.debugRequires2Engineering, 1)
    const finalCredits = guild.ship.credits
    chai.expect(finalCredits).to.equal(initialCredits - 1)
    const finalTelemetry = guild.ship.equipment.find(
      (e) => e.equipmentType === `telemetry`,
    ).list[0]
    assert(finalTelemetry)
    chai.expect(finalTelemetry.id).to.equal(`debugRequires2Engineering`)
  })

  it(`should properly replace singleton items on add`, async () => {
    const guild = game.guilds[0]
    const initial = guild.ship.equipment.find(
      (e) => e.equipmentType === `telemetry`,
    ).list.length
    assert(initial === 1)
    guild.ship.addPart(equipment.telemetry.image1, 0)
    guild.ship.addPart(equipment.telemetry.image1, 0)
    const final = guild.ship.equipment.find(
      (e) => e.equipmentType === `telemetry`,
    ).list.length
    assert(final === 1)
    chai
      .expect(
        guild.ship.equipment.find((e) => e.equipmentType === `telemetry`)
          .list[0].id,
      )
      .to.equal(`image1`)
  })

  it(`should properly give new equipment live properties on add`, async () => {
    const guild = game.guilds[0]
    const telemetry = guild.ship.equipment.find(
      (e) => e.equipmentType === `telemetry`,
    ).list[0]
    assert(telemetry.displayName)
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
      path.resolve(`./`, `test/output`, `shipEquipment.txt`),
      outputToWriteToFile.join(`\n`),
    )
  })
})
