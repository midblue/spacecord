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

let outputToWriteToFile = []

describe(`Gravity`, async () => {
  it(`should be [0, 0] between two objects in the same location`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      name: `Test Planet 1`,
      location: [0, 0],
      color: `white`,
    }
    game.planets.push(testPlanet)

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
      name: `Test Planet 1`,
      location: [0, 0],
      color: `white`,
    }
    game.planets.push(testPlanet)

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
      name: `Test Planet 1`,
      location: [0, 0],
      color: `white`,
      mass: 100000,
    }
    game.planets.push(testPlanet)

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

  it(`should have a vector pointing from thatBody to thisBody between two objects in horizontal line`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      name: `Test Planet 1`,
      location: [2, 0],
      color: `white`,
      mass: 100000,
    }
    game.planets.push(testPlanet)

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

    expectedForceVector = [
      (GRAVITATIONAL_CONSTANT * testPlanet.mass * testShip.getTotalMass()) /
        2 ** 2,
      0,
    ]

    expect(forceVectorOnShip).to.be.deep.almost(expectedForceVector)
  })

  it(`should have the correct vector pointing from thatBody to thisBody between two objects in vertical line`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      name: `Test Planet 1`,
      location: [0, 2],
      color: `white`,
      mass: 100000,
    }
    game.planets.push(testPlanet)

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

    expectedForceVector = [
      0,
      (GRAVITATIONAL_CONSTANT * testPlanet.mass * testShip.getTotalMass()) /
        2 ** 2,
    ]

    expect(forceVectorOnShip).to.be.deep.almost(expectedForceVector)
  })

  it(`should have the correct vector pointing from thatBody to thisBody between two objects on 45-degree diagonal line`, async () => {
    const game = require(`../game/manager`)

    const testPlanet = {
      name: `Test Planet 1`,
      location: [2, 2],
      color: `white`,
      mass: 100000,
    }
    game.planets.push(testPlanet)

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

    expectedMagnitude =
      (GRAVITATIONAL_CONSTANT * testPlanet.mass * testShip.getTotalMass()) /
      (2 * Math.sqrt(2)) ** 2
    expectedForceVector = [
      expectedMagnitude / Math.sqrt(2),
      expectedMagnitude / Math.sqrt(2),
    ]

    expect(forceVectorOnShip).to.be.deep.almost(expectedForceVector)
  })
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
