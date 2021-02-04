const { spawn } = require('../manager')

async function spawnAll({ context }) {
  livePlanets = planets.map((planet) => {
    planet = { ...planetDefaults(), ...planet }
    liveify(planet, context)
    return planet
  })
  return livePlanets
}

function liveify(planet, context) {
  planet.context = context

  // // add base properties to ship
  // planet.ship = {
  //   ...shipsData[planet.ship.model],
  //   ...planet.ship, // this order allows us to have "unique" items/ships
  // }

  // addins.forEach((addin) => addin(planet))
}

module.exports = spawnAll

const planetDefaults = () => ({ location: [0, 0], color: 'green', size: 1 })
const planets = [
  {
    name: 'Origin',
  },
  {
    name: 'Exodus',
    location: [-3, -3],
  },
]
