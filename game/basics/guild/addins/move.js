const story = require('../../story/story')
const { bearingToRadians } = require('../../../../common')

module.exports = (guild) => {
  guild.ship.move = (useFuel = true, coordinates) => {
    const ship = guild.ship

    const fuel = ship.cargo.find((c) => c.type === 'fuel')
    if (!fuel.amount)
      return {
        ok: false,
      }

    let ok = true,
      message

    const currentLocation = [ship.location[0] || 0, ship.location[1] || 0]
    const currentBearing = bearingToRadians(ship.bearing || [0, 1])
    let distanceToTravel = ship.speed || 0
    if (coordinates) {
      const a = ship.location[0] - coordinates[0],
        b = ship.location[1] - coordinates[1]
      distanceToTravel = Math.sqrt(a * a + b * b)
    }
    const fuelLoss = useFuel
      ? (ship.equipment.engine || []).reduce((total, engine) => {
          return total + (engine.fuelUse || 0) * distanceToTravel
        }, 0)
      : 0

    if (coordinates) ship.location = coordinates
    else {
      const newX =
        currentLocation[0] + distanceToTravel * Math.cos(currentBearing)
      const newY =
        currentLocation[1] + distanceToTravel * Math.sin(currentBearing)
      ship.location = [newX, newY]
    }
    console.log(ship.location)

    fuel.amount -= fuelLoss
    if (fuel.amount <= 0) {
      fuel.amount = 0
      ship.status.stranded = true
      ok = false
      message = story.fuel.insufficient()
    }

    return {
      ok,
      distanceTraveled: distanceToTravel,
      message,
    }
  }
}
