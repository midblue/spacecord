const fs = require(`fs`)
const path = require(`path`)
const { expect } = require(`chai`)
const chai = require(`chai`)
const chaiAlmost = require(`chai-almost`)

chai.use(chaiAlmost())

const { addShip } = require(`./tools/utils`)
const {
  getGravityForceVectorOnThisBodyDueToThatBody,
} = require(`../game/gamecommon`)
const { getUnitVectorFromThatBodyToThisBody } = require(`../common`)

let outputToWriteToFile = []

describe(`Gravity`, async () => {

  it(`unit vector from planet to ship should return [0, 0] for ship + planet on same point`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [0, 0],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [0, 0],
      debugMass: 1000,
      velocity: [0, 0],
    })

    expect(
      getUnitVectorFromThatBodyToThisBody(testShip, testPlanet),
    ).to.deep.equal([0, 0])
  })

  it(`unit vector from planet to ship should return [-1, 0] for ship to left of planet`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [1, 0],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [0, 0],
      debugMass: 1000,
      velocity: [0, 0],
    })

    expect(
      getUnitVectorFromThatBodyToThisBody(testShip, testPlanet),
    ).to.deep.almost.equal([-1, 0])
  })

  it(`unit vector from planet to ship should return [1, 0] for ship to right of planet`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [0, 0],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [1, 0],
      debugMass: 1000,
      velocity: [0, 0],
    })

    expect(
      getUnitVectorFromThatBodyToThisBody(testShip, testPlanet),
    ).to.be.deep.almost([1, 0])
  })

  it(`unit vector from planet to ship should return [0, 1] for ship north of planet`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [0, 0],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [0, 1],
      debugMass: 1000,
      velocity: [0, 0],
    })

    expect(
      getUnitVectorFromThatBodyToThisBody(testShip, testPlanet),
    ).to.be.deep.almost([0, 1])
  })

  it(`unit vector from planet to ship should return [0, -1] for ship south of planet`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [0, 0],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [0, -1],
      debugMass: 1000,
      velocity: [0, 0],
    })

    expect(
      getUnitVectorFromThatBodyToThisBody(testShip, testPlanet),
    ).to.be.deep.almost([0, -1])
  })

  it(`unit vector from planet to ship should return [sqrt(2), sqrt(2)] for ship northeast of planet`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [0, 0],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [1, 1],
      debugMass: 1000,
      velocity: [0, 0],
    })

    expect(
      getUnitVectorFromThatBodyToThisBody(testShip, testPlanet),
    ).to.be.deep.almost([Math.sqrt(2) / 2, Math.sqrt(2) / 2])
  })

  it(`should be [0, 0] between two objects in the same location`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [0, 0],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [0, 0],
      debugMass: 1000,
      velocity: [0, 0],
    })

    expect(
      getGravityForceVectorOnThisBodyDueToThatBody(testShip, testPlanet),
    ).to.deep.equal([0, 0])
  })

  it(`should be [0, 0] between two objects outside of gravity range`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [0, 0],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [0, GRAVITY_RANGE + 0.00001],
      debugMass: 1000,
      velocity: [0, 0],
    })

    expect(
      getGravityForceVectorOnThisBodyDueToThatBody(testShip, testPlanet),
    ).to.deep.equal([0, 0])
  })

  it(`should not be [0,0] between two objects inside of gravity range`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [0, 0],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [0, GRAVITY_RANGE * 0.999],
      debugMass: 1000,
      velocity: [0, 0],
    })

    expect(
      getGravityForceVectorOnThisBodyDueToThatBody(
        {
          ...testShip,
          mass: testShip.getTotalMass(),
        },
        testPlanet,
      ),
    ).not.to.deep.equal([0, 0])
  })

  it(`should have a gravity vector on a ship pointing from the ship to the planet in a horizontal line`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [2, 0],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [0, 0],
      debugMass: 1000,
      velocity: [0, 0],
    })

    forceVectorOnShip = getGravityForceVectorOnThisBodyDueToThatBody(
      {
        ...testShip,
        mass: testShip.getTotalMass(),
      },
      testPlanet,
    )

    r = 2 * KM_PER_AU * M_PER_KM
    expectedForceVector = [
      (GRAVITATIONAL_CONSTANT * 100000 * 1000) /
      (r ** 2),
      0
    ]

    expect(forceVectorOnShip).to.be.deep.almost(expectedForceVector)
  })

  it(`should have a gravity vector on a ship pointing from the ship to the planet in a vertical line`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [0, 2],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [0, 0],
      debugMass: 1000,
      velocity: [0, 0],
    })

    forceVectorOnShip = getGravityForceVectorOnThisBodyDueToThatBody(
      {
        ...testShip,
        mass: testShip.getTotalMass(),
      },
      testPlanet,
    )

    r = 2 * KM_PER_AU * M_PER_KM
    expectedForceVector = [
      0,
      (GRAVITATIONAL_CONSTANT * testPlanet.mass * testShip.getTotalMass()) /
      (r ** 2),
    ]

    expect(forceVectorOnShip).to.be.deep.almost(expectedForceVector)
  })

  it(`should have a gravity vector on a ship pointing from the ship to the planet in a 45-degree diagonal line`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      location: [2, 2],
      mass: 100000,
    }
    game.planets = [testPlanet]

    const testShip = await addShip({
      name: `Test Ship 1`,
      location: [0, 0],
      debugMass: 1000,
      velocity: [0, 0],
    })

    forceVectorOnShip = getGravityForceVectorOnThisBodyDueToThatBody(
      {
        ...testShip,
        mass: testShip.getTotalMass(),
      },
      testPlanet,
    )

    r = 2 * Math.sqrt(2) * KM_PER_AU * M_PER_KM

    expectedMagnitude =
      (GRAVITATIONAL_CONSTANT * testPlanet.mass * testShip.getTotalMass()) /
      (r ** 2)
    expectedForceVector = [
      expectedMagnitude / Math.sqrt(2),
      expectedMagnitude / Math.sqrt(2),
    ]

    expect(forceVectorOnShip).to.be.deep.almost(expectedForceVector)
  })

  before(() => {
    console.log = (...args) => {
      outputToWriteToFile.push(
        args.map((a) => (typeof a === `object` ? JSON.stringify(a, null, 2) : a)),
      )
    }
  })

  beforeEach(async () => {
    const game = require(`../game/manager`)
    game.planets = []
    game.guilds = []
    game.caches = []
  })

  after(() => {
    fs.writeFileSync(
      path.resolve(`./`, `test/output`, `motion.txt`),
      outputToWriteToFile.join(`\n`),
    )
  })
})

