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

  planet.getSizeDescriptor = function () {
    if (this.size > 5) return 'large'
    if (this.size < 2) return 'small'
    return 'normal-sized'
  }

  // // add base properties to ship
  // planet.ship = {
  //   ...shipsData[planet.ship.model],
  //   ...planet.ship, // this order allows us to have "unique" items/ships
  // }

  // addins.forEach((addin) => addin(planet))
}

module.exports = spawnAll

const planetDefaults = () => ({
  location: [0, 0],
  color: 'green',
  size: 1,
})
const planets = [
  {
    name: 'Origin',
  },
  {
    name: 'Exodus',
    location: [-3, -3],
    color: 'black',
  },
]
