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
const { guild } = require(`../game/manager`)
const { expect } = require(`chai`)
const brake = require(`../discord/commands/brake`)
const depart = require(`../discord/commands/depart`)
const { degreesToUnitVector } = require(`../common`)
const liveifyPlanet = require(`../game/basics/planet`).liveify

let outputToWriteToFile = []

describe(`Ship Motion`, () => {
  it(`thrust should fire in provided direction`, async () => {
    const testShip = await utils.addShip({
      name: `Test Ship 1`,
      location: [0, 0],
      debugMass: 1000,
      velocity: [1 / KM_PER_AU, 0],
    })
    testShip.power = 10000
    testShip.status.docked = false
    const member = testShip.members[0]
    member.stamina = 10000
    thrust = testShip.thrust({ power: 1, angle: 90, thruster: member })

    console.log(`appliedThrust`, thrust, thrust.thrustUnitVector)
    chai.expect(thrust.thrustUnitVector).to.be.deep.almost([0, 1])
  })

  it(`brake/slowdown command should fire thrusters in same direction as ship velocity`, async () => {
    const guild = game.guilds[0]
    guild.ship.velocity = [1, 0]
    guild.ship.status.docked = false
    guild.ship.power = 100

    const member = guild.ship.members[0]
    member.stamina = 1000

    shipBrake = await brake.action({
      msg,
      guild: guild,
      authorCrewMemberObject: member,
    })

    chai
      .expect(degreesToUnitVector(shipBrake.thrustAngle))
      .to.be.deep.almost([1, 0])
  })

  it(`should have ships land and become 'docked' on the surface when they collide with planets`, async () => {
    const guild = game.guilds[0]
    guild.ship.velocity = [1, 0]
    guild.ship.status.docked = false
    guild.ship.power = 100

    const member = guild.ship.members[0]
    member.stamina = 1000
  })

  it(`should have ships land on the proper location on the surface when they collide with planets`, async () => {
    const guild = game.guilds[0]
    guild.ship.velocity = [1, 0]
    guild.ship.status.docked = false
    guild.ship.power = 100

    const member = guild.ship.members[0]
    member.stamina = 1000
  })

  it(`ship should be placed x% out from planet surface when it departs a planet it is landed on`, async () => {
    const testPlanet = {
      location: [0, 0],
      radius: 6e21, // earth radius in km
      mass: 100000,
    }
    liveifyPlanet(testPlanet, game)
    game.planets = [testPlanet]

    const guild = game.guilds[0]
    guild.ship.velocity = [0, 0]
    guild.ship.power = 100

    console.log(`position`, guild.ship.location)
    const member = guild.ship.members[0]
    member.stamina = 1000

    await guild.ship.depart({ msg, guild: guild, planet: testPlanet })

    chai.expect(guild.ship.location).to.be.deep.almost()
  })

  it(`should `, async () => {
    const testPlanet = {
      location: [0, 0],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await utils.addShip({
      name: `Test Ship 1`,
      location: [0, 0],
      debugMass: 1000,
      velocity: [0, 0],
    })
    game.ships = [testShip]

    // assert(false, `Tony Kong <(B{|)`)
  })

  before(async () => {
    try {
      await mongoose.connection.collection(`guilds`).drop()
      await mongoose.connection.collection(`ships`).drop()
      await mongoose.connection.collection(`users`).drop()
      game.guilds = []
      game.planets = []
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
      path.resolve(`./`, `test/output`, `shipMotion.txt`),
      outputToWriteToFile.join(`\n`),
    )
  })
})
