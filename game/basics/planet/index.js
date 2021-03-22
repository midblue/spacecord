const defaults = () => ({
  shipyardPriceMultiplier: 1,
  shipyardSellMultiplier: 0.5,
  shipyard: {},
  location: [0, 0],
  color: `green`,
  mass: 5.974e29, // kg
  radius: 6371, // km
})

// * get all exports from files in this folder
const fs = require(`fs`)
const planets = []
fs.readdir(__dirname, (err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(`.js`) || file === `index.js`) return
    planets.push({
      ...defaults(),
      ...require(`./${file}`),
      name: file.substring(0, file.length - 3),
    })
  })
})

async function spawnAll({ context }) {
  const livePlanets = planets.map((planet) => {
    liveify(planet, context)
    return planet
  })
  return livePlanets
}

function liveify(planet, context) {
  planet.context = context

  planet.getSizeDescriptor = function () {
    if (this.radius > 8500) return `large`
    if (this.radius < 4000) return `small`
    return `normal-sized`
  }

  planet.getDockedShips = function () {
    return this.context.guilds.filter(
      (g) => g.ship?.status?.docked === this.name,
    )
  }

  planet.saveableData = function () {
    return JSON.parse(JSON.stringify({ ...this, context: null }))
  }
}

module.exports = { spawnAll, naiveList: planets }
