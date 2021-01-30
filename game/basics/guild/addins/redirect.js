const { bearingToDegrees, bearingToArrow } = require('../../../../common')
const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.redirect = (aggregate = []) => {
    if (!aggregate.length)
      return {
        ok: false,
      }
    const directionVector = getShipDirectionFromAggregate(aggregate)
    // const previousBearing = guild.ship.bearing
    guild.ship.bearing = directionVector
    const arrow = bearingToArrow(directionVector)
    const degrees = bearingToDegrees(directionVector)
    return {
      ok: true,
      arrow,
      degrees,
    }
  }
}

function getShipDirectionFromAggregate(aggregate) {
  // aggregate is in form [{vector: [x, y], weight: 0..1}]
  const totalWeight = aggregate.reduce(
    (total, current) => (total += current.weight),
    0,
  )
  const xVector =
    aggregate.reduce(
      (total, current) => (total += current.vector[0] * current.weight),
      0,
    ) / totalWeight
  const yVector =
    aggregate.reduce(
      (total, current) => (total += current.vector[1] * current.weight),
      0,
    ) / totalWeight
  return [xVector, yVector]
}
