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
const powerRequirements = require(`../game/basics/guild/powerRequirements`)

let outputToWriteToFile = []

describe(`Ship Power`, () => {
  it(`should have a total ship max power equivalent to all batteries' capacity combined (adjusted for repair)`, async () => {
    await utils.addShip({})
    const guild = game.guilds[0]
    const batteries = guild.ship.equipment.find(
      (e) => e.equipmentType === `battery`,
    ).list
    guild.ship.addPart(equipment.battery.battery2, 0)
    const maxPower = guild.ship.maxPower()
    const expectedMaxPower = batteries.reduce(
      (total, b) => total + b.capacity * b.repair,
      0,
    )
    chai.expect(maxPower).to.equal(expectedMaxPower)

    batteries.forEach((b) => (b.repair = 0.25))
    const maxPower2 = guild.ship.maxPower()
    const expectedMaxPower2 = batteries.reduce(
      (total, b) => total + b.capacity * b.repair,
      0,
    )
    chai.expect(maxPower2).to.equal(expectedMaxPower2)
  })

  it(`should be possible to charge the batteries`, async () => {
    const guild = game.guilds[0]
    guild.ship.power = 0
    const initial = guild.ship.power
    guild.ship.addPower(1)
    const final = guild.ship.power
    chai.expect(initial).to.equal(0)
    chai.expect(final).to.equal(initial + 1)
  })

  it(`should not be possible to charge the batteries over 100%`, async () => {
    const guild = game.guilds[0]
    guild.ship.power = 0
    guild.ship.addPower(1000000000)
    chai.expect(guild.ship.power).to.equal(guild.ship.maxPower())
  })

  it(`should not be possible to do power-related activities without power`, async () => {
    const guild = game.guilds[0]
    guild.ship.power = 0
    const crewMember = guild.ship.members[0]
    crewMember.stamina = 100
    const eBrake = require(`../discord/commands/eBrake`).action
    const res = await eBrake({
      msg,
      guild,
      authorCrewMemberObject: crewMember,
    })
    assert(!res)
  })

  it(`should use the proper amount of power on power-related activites`, async () => {
    const guild = game.guilds[0]
    guild.ship.power = 100
    const initial = guild.ship.power
    const cost = powerRequirements.eBrake
    const crewMember = guild.ship.members[0]
    crewMember.stamina = 100
    const eBrake = require(`../discord/commands/eBrake`).action
    await eBrake({
      msg,
      guild,
      authorCrewMemberObject: crewMember,
    })
    const final = guild.ship.power
    console.log(initial, guild.ship.maxPower(), final, guild.ship.power)
    chai.expect(final).to.equal(initial - cost)
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
      path.resolve(`./`, `test/output`, `shipPower.txt`),
      outputToWriteToFile.join(`\n`),
    )
  })
})
