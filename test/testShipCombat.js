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

describe(`Ship Combat`, () => {
  it(`should be able to hit a ship within range`, async () => {
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
    ship2.equipment.find((e) => e.equipmentType === `weapon`).list = []
    ship2.addPart(equipment.weapon.debugAlwaysMiss)

    const res = await ship1.attackShip({
      enemyShip: ship2,
      weapon: ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
      target: null,
      collectiveMunitionsSkill: 100,
    })

    assert(res.ok === true)
    assert(res.didHit === true)
  })

  it(`should not be able to attack when weapons are on cooldown`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship
    const res = await ship1.attackShip({
      enemyShip: ship2,
      weapon: ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
      target: null,
      collectiveMunitionsSkill: 100,
    })

    assert(res.ok === false)
  })

  it(`should always miss a ship outside of range`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship
    ship1.removePart(
      ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
    )
    ship1.addPart(equipment.weapon.debugAlwaysHit1)
    ship2.location = [1, 2.01]
    const res = await ship1.attackShip({
      enemyShip: ship2,
      weapon: ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
      target: null,
      collectiveMunitionsSkill: 100,
    })

    assert(res.ok === false)
  })

  it(`should take the right amount of equipment damage on being hit by an attack`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship
    ship2.equipment = ship2.equipment.map((e) => {
      if (e.equipmentType === `chassis`) return { ...e }
      return { ...e, list: [] }
    })
    ship2.equipment.find(
      (e) => e.equipmentType === `chassis`,
    ).list[0].repair = 1
    ship2.location = [1.001, 1.001]
    ship1.removePart(
      ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
    )
    ship1.addPart(equipment.weapon.debugAlwaysHit1)

    const res = await ship1.attackShip({
      enemyShip: ship2,
      weapon: ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
      target: null,
      collectiveMunitionsSkill: 100,
    })
    console.log(res)

    assert(res.didHit)
    chai
      .expect(
        (1 - res.damageTaken[0].equipment.repair) *
          res.damageTaken[0].equipment.baseHp,
      )
      .to.equal(res.damageTaken[0].damage)
  })

  it(`should deal cascading damage to other equipment on destroying the first piece`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship
    ship2.addPart(equipment.scanner.basic1)
    ship2.equipment.find(
      (e) => e.equipmentType === `chassis`,
    ).list[0].repair = 1
    ship1.removePart(
      ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
    )
    ship1.addPart({ ...equipment.weapon.debugAlwaysHit1, damage: 10 })

    const res = await ship1.attackShip({
      enemyShip: ship2,
      weapon: ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
      target: ship2.equipment.find((e) => e.equipmentType === `scanner`)
        .list[0],
      collectiveMunitionsSkill: 100,
    })

    assert(res.didHit)
    chai
      .expect(
        (1 - res.damageTaken[0].equipment.repair) *
          res.damageTaken[0].equipment.baseHp,
      )
      .to.equal(res.damageTaken[0].damage)
    assert(res.damageTaken[0].wasDisabled)
    chai
      .expect(
        ship2.equipment.find((e) => e.equipmentType === `scanner`).list[0]
          .repair,
      )
      .to.equal(0)

    chai
      .expect(
        (1 - res.damageTaken[1].equipment.repair) *
          res.damageTaken[1].equipment.baseHp,
      )
      .to.equal(res.damageTaken[1].damage)
    assert(!res.damageTaken[1].wasDisabled)
    chai
      .expect(
        ship2.equipment.find((e) => e.equipmentType === `chassis`).list[0]
          .repair,
      )
      .to.equal(res.damageTaken[1].equipment.repair)
  })

  it(`should use ship armor first to mitigate damage taken`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship
    ship2.equipment.find(
      (e) => e.equipmentType === `scanner`,
    ).list[0].repair = 1
    ship2.equipment.find(
      (e) => e.equipmentType === `chassis`,
    ).list[0].repair = 1
    ship2.addPart(equipment.armor.debugPerfectCoverage)

    ship1.removePart(
      ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
    )
    ship1.addPart({ ...equipment.weapon.debugAlwaysHit1, damage: 10 })

    const res = await ship1.attackShip({
      enemyShip: ship2,
      weapon: ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
      target: ship2.equipment.find((e) => e.equipmentType === `scanner`)
        .list[0],
      collectiveMunitionsSkill: 100,
    })

    chai.expect(res.damageTaken[0].equipment.type).to.equal(`armor`)
  })

  it(`should take less damage to ship armor than other equipment`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship
    ship2.equipment.find(
      (e) => e.equipmentType === `scanner`,
    ).list[0].repair = 1
    ship2.equipment.find(
      (e) => e.equipmentType === `chassis`,
    ).list[0].repair = 1
    ship2.equipment.find((e) => e.equipmentType === `armor`).list[0].repair = 1

    ship1.removePart(
      ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
    )
    ship1.addPart({ ...equipment.weapon.debugAlwaysHit1, damage: 10 })

    const res = await ship1.attackShip({
      enemyShip: ship2,
      weapon: ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
      target: ship2.equipment.find((e) => e.equipmentType === `scanner`)
        .list[0],
      collectiveMunitionsSkill: 100,
    })

    chai.expect(res.damage).to.be.greaterThan(res.totalDamageTaken)
  })

  it(`should destroy the ship on its reaching 0 hp`, async () => {
    const ship1 = game.guilds[0].ship
    const ship2 = game.guilds[1].ship

    // * setup for next test
    ship2.credits = 100
    ship2.cargo.find((c) => c.cargoType === `fuel`).amount = 200

    ship1.removePart(
      ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
    )
    ship1.addPart({ ...equipment.weapon.debugAlwaysHit1, damage: 80 })

    const res = await ship1.attackShip({
      enemyShip: ship2,
      weapon: ship1.equipment.find((e) => e.equipmentType === `weapon`).list[0],
      target: ship2.equipment.find((e) => e.equipmentType === `scanner`)
        .list[0],
      collectiveMunitionsSkill: 100,
    })

    chai.expect(res.destroyedShip).to.equal(true)
    chai.expect(ship2.status.dead).to.equal(true)
  })

  it(`should jettison all of the ship's cargo on death, scaled by a percentage`, async () => {
    chai.expect(game.caches.length).to.equal(2)
    chai
      .expect(game.caches.find((c) => c.type === `credits`).amount)
      .to.equal(100 * DEATH_LOOT_PERCENT)
    chai
      .expect(game.caches.find((c) => c.type === `fuel`).amount)
      .to.equal(200 * DEATH_LOOT_PERCENT)
  })

  it(`should spawn an attack remnant on each attack`, async () => {
    chai.expect(game.attackRemnants.length).to.be.greaterThan(0)
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
    try {
      await mongoose.connection.collection(`caches`).drop()
    } catch (e) {}
    try {
      await mongoose.connection.collection(`attackremnants`).drop()
    } catch (e) {}
    game.guilds = []
    game.planets = []
    game.caches = []
    game.attackRemnants = []

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
