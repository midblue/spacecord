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
const { equipment, liveify } = require(`../game/basics/equipment/equipment`)

let outputToWriteToFile = []

describe(`Ship Repair`, () => {
  it(`should use engine durability on thrust`, async () => {
    const ship = await utils.addShip({
      location: [1, 1],
      status: { docked: false, dead: false },
    })
    ship.equipment.find((e) => e.equipmentType === `engine`).list = []
    ship.addPart(equipment.engine.basic1)
    liveify(ship.equipment.find((e) => e.equipmentType === `engine`).list[0])
    ship.thrust({ power: 1, angle: 0, thruster: ship.members[0] })
    chai
      .expect(
        ship.equipment.find((e) => e.equipmentType === `engine`).list[0].repair,
      )
      .to.be.lessThan(1)
  })

  it(`should use telemetry durability on scan`, async () => {
    const guild = game.guilds[0]
    guild.ship.equipment.find((e) => e.equipmentType === `telemetry`).list = []
    guild.ship.addPart(equipment.telemetry.debugRequires2Engineering)
    liveify(
      guild.ship.equipment.find((e) => e.equipmentType === `telemetry`).list[0],
    )
    const part = guild.ship.equipment.find(
      (e) => e.equipmentType === `telemetry`,
    ).list[0]
    part.requirements = null
    await guild.ship.scanArea(false, guild.ship.members[0])

    chai.expect(part.repair).to.be.lessThan(1)
  })

  it(`should use battery durability on scan`, async () => {
    const guild = game.guilds[0]
    guild.ship.power = 1000
    const part = guild.ship.equipment.find((e) => e.equipmentType === `battery`)
      .list[0]
    part.repair = 1
    console.log(part)
    await guild.ship.scanArea(false, guild.ship.members[0])

    chai.expect(part.repair).to.be.lessThan(1)
  })

  it(`should use ship scanner durability on ship scan`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = await utils.addShip(
      {
        location: [1.00001, 1.00001],
        status: { docked: false, dead: false },
      },
      true,
    )
    ship1.equipment.find((e) => e.equipmentType === `scanner`).list = []
    ship1.addPart(equipment.scanner.basic1)
    liveify(ship1.equipment.find((e) => e.equipmentType === `scanner`).list[0])
    const part = ship1.equipment.find((e) => e.equipmentType === `scanner`)
      .list[0]
    part.repair = 1
    part.requirements = null

    const res = ship1.scanOtherShip(ship2)

    assert(res.ok)
    chai.expect(part.repair).to.be.lessThan(1)
  })

  it(`should use transceiver durability on broadcast`, async () => {
    const guild = game.guilds[0]
    guild.ship.addPart(equipment.transceiver.transceiver1)
    liveify(
      guild.ship.equipment.find((e) => e.equipmentType === `transceiver`)
        .list[0],
    )
    const part = guild.ship.equipment.find(
      (e) => e.equipmentType === `transceiver`,
    ).list[0]
    part.requirements = null
    await guild.ship.broadcast({
      broadcastType: `distress`,
      equipment: part,
      yesPercent: 1,
      collectiveSkill: 1,
    })

    chai.expect(part.repair).to.be.lessThan(1)
  })

  it(`should use weapon durability on attack`, async () => {
    const ship2 = game.guilds[1].ship
    const guild = game.guilds[0]
    const part = guild.ship.equipment.find((e) => e.equipmentType === `weapon`)
      .list[0]
    part.repair = 1
    part.requirements = null
    await guild.ship.attackShip({
      enemyShip: ship2,
      weapon: part,
      target: null,
      collectiveMunitionsSkill: 100,
    })

    chai.expect(part.repair).to.be.lessThan(1)
  })

  it(`should be possible to repair equipment, and repair should not go above 100%`, async () => {
    const guild = game.guilds[0]
    const part = guild.ship.equipment.find((e) => e.equipmentType === `weapon`)
      .list[0]
    chai.expect(part.repair).to.be.lessThan(1)
    const res = guild.ship.repairEquipment({
      type: `weapon`,
      index: 0,
      add: 100,
    })
    assert(res.ok)
    chai.expect(part.repair).to.equal(1)
  })

  it(`should not be possible to use a broken engine`, async () => {
    const ship = game.guilds[0].ship
    ship.equipment.find((e) => e.equipmentType === `engine`).list = []
    ship.addPart(equipment.engine.basic1)
    const part = ship.equipment.find((e) => e.equipmentType === `engine`)
      .list[0]
    liveify(part)
    part.repair = 0
    const res = ship.thrust({ power: 1, angle: 0, thruster: ship.members[0] })
    chai.expect(res.ok).to.equal(false)
  })

  it(`should not be possible to use a broken telemetry system`, async () => {
    const guild = game.guilds[0]
    guild.ship.power = 100
    const part = guild.ship.equipment.find(
      (e) => e.equipmentType === `telemetry`,
    ).list[0]
    part.requirements = null
    part.repair = 0
    const res = await guild.ship.scanArea(false, guild.ship.members[0])
    chai.expect(res.ok).to.equal(false)
    // * prep for next test
    part.repair = 1
  })

  it(`should not be possible to use a broken battery`, async () => {
    const guild = game.guilds[0]
    guild.ship.power = 100
    guild.ship.equipment.find((e) => e.equipmentType === `battery`).list = []
    guild.ship.addPart(equipment.battery.battery1)
    const part = guild.ship.equipment.find((e) => e.equipmentType === `battery`)
      .list[0]
    part.requirements = null
    part.repair = 0
    const res = await guild.ship.scanArea(false, guild.ship.members[0])
    chai.expect(res.ok).to.equal(false)
    // * prep for next test
    part.repair = 1
  })

  it(`should not be possible to use a broken ship scanner`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship
    const part = ship1.equipment.find((e) => e.equipmentType === `scanner`)
      .list[0]
    part.repair = 0
    part.requirements = null
    const res = ship1.scanOtherShip(ship2)
    assert(!res.ok)
  })

  it(`should not be possible to use a broken transceiver`, async () => {
    const guild = game.guilds[0]
    const part = guild.ship.equipment.find(
      (e) => e.equipmentType === `transceiver`,
    ).list[0]
    part.requirements = null
    part.repair = 0
    const res = await guild.ship.broadcast({
      broadcastType: `distress`,
      equipment: part,
      yesPercent: 1,
      collectiveSkill: 1,
    })
    console.log(res)
    chai.expect(res.ok).to.equal(false)
  })

  it(`should not be possible to use a broken weapon`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship
    ship1.equipment.find((e) => e.equipmentType === `weapon`).list = []
    ship1.addPart(equipment.weapon.debugAlwaysHit1)
    const part = ship1.equipment.find((e) => e.equipmentType === `weapon`)
      .list[0]
    part.repair = 0
    part.requirements = null
    console.log(part)
    const res = await ship1.attackShip({
      enemyShip: ship2,
      weapon: part,
      target: null,
      collectiveMunitionsSkill: 100,
    })
    console.log(res)

    chai.expect(res.ok).to.equal(false)
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
    game.planets = []

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
