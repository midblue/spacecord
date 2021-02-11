const story = require('../../story/story')
const {
  bearingToRadians,
  bearingToDegrees,
  bearingToArrow,
  distance,
} = require('../../../../common')

module.exports = (guild) => {
  guild.ship.effectiveSpeed = () => {
    const rawMaxSpeed = guild.ship.equipment.engine.reduce(
      (total, engine) => engine.maxSpeed + total,
      0,
    )

    let percentOfMaxShipWeight =
      guild.ship.getTotalWeight() / guild.ship.maxWeight
    if (percentOfMaxShipWeight > 1) percentOfMaxShipWeight = 1

    let effectiveSpeed =
      (guild.ship.speed || 0) * rawMaxSpeed * (1 - percentOfMaxShipWeight)
    if (effectiveSpeed < 0) effectiveSpeed = 0

    return effectiveSpeed
  }

  guild.ship.fuelUsePerTick = () => {
    return (guild.ship.equipment.engine || []).reduce((total, engine) => {
      return total + (engine.fuelUse || 0) * (guild.ship.speed || 0)
    }, 0)
  }

  guild.ship.redetermineSpeed = (aggregate = []) => {
    if (!aggregate.length)
      return {
        ok: false,
      }
    const { voteResult, newSpeed } = getShipSpeedFromAggregate(aggregate, guild)
    const previousSpeed = guild.ship.speed
    if (previousSpeed !== newSpeed) {
      guild.ship.speed = newSpeed
      guild.ship.logEntry(
        story.move.adjustSpeed.success(
          newSpeed > previousSpeed,
          newSpeed,
          voteResult / 10,
          aggregate.length,
        ),
      )
      guild.saveNewDataToDb()
    }
    return {
      ok: true,
      newSpeed,
      previousSpeed,
      voteResult,
    }
  }

  guild.ship.getAvailableSpeedLevels = () => {
    const availableSpeedLevels = []

    const bestShipSpeedLevels = guild.ship.equipment.engine.reduce(
      (max, engine) => Math.max(max, engine.powerLevels || 0),
      2,
    )

    availableSpeedLevels.push({ emoji: '🔟', speed: 1 })
    if (bestShipSpeedLevels > 1)
      availableSpeedLevels.push({ emoji: '0️⃣', speed: 0 })
    if (bestShipSpeedLevels > 2)
      availableSpeedLevels.push({ emoji: '5️⃣', speed: 0.5 })
    if (bestShipSpeedLevels > 3)
      availableSpeedLevels.push({ emoji: '7️⃣', speed: 0.7 })
    if (bestShipSpeedLevels > 4)
      availableSpeedLevels.push({ emoji: '2️⃣', speed: 0.2 })
    if (bestShipSpeedLevels > 5)
      availableSpeedLevels.push({ emoji: '1️⃣', speed: 0.1 })
    if (bestShipSpeedLevels > 6)
      availableSpeedLevels.push({ emoji: '9️⃣', speed: 0.9 })
    if (bestShipSpeedLevels > 7)
      availableSpeedLevels.push({ emoji: '4️⃣', speed: 0.4 })
    if (bestShipSpeedLevels > 8)
      availableSpeedLevels.push({ emoji: '8️⃣', speed: 0.8 })
    if (bestShipSpeedLevels > 9)
      availableSpeedLevels.push({ emoji: '3️⃣', speed: 0.3 })
    if (bestShipSpeedLevels > 10)
      availableSpeedLevels.push({ emoji: '6️⃣', speed: 0.6 })

    return availableSpeedLevels
  }

  guild.ship.getAvailableDirections = () => {
    const availableDirections = []

    const bestShipDirections = guild.ship.equipment.engine.reduce(
      (max, engine) => Math.max(max, engine.directions || 0),
      4,
    )

    availableDirections.push({ emoji: '➡️', vector: [1.414, 0] })
    if (bestShipDirections > 4)
      availableDirections.push({ emoji: '↗️', vector: [1, 1] })
    availableDirections.push({ emoji: '⬆️', vector: [0, 1.414] })
    if (bestShipDirections > 5)
      availableDirections.push({ emoji: '↖️', vector: [-1, 1] })
    availableDirections.push({ emoji: '⬅️', vector: [-1.414, 0] })
    if (bestShipDirections > 6)
      availableDirections.push({ emoji: '↙️', vector: [-1, -1] })
    availableDirections.push({ emoji: '⬇️', vector: [0, -1.414] })
    if (bestShipDirections > 7)
      availableDirections.push({ emoji: '↘️', vector: [1, -1] })

    return availableDirections
  }

  guild.ship.isOOB = () => {
    return (
      distance(0, 0, ...guild.ship.location) > guild.context.gameDiameter() / 2
    )
  }

  guild.ship.move = (useFuel = true, coordinates) => {
    const ship = guild.ship

    const fuel = ship.cargo.find((c) => c.type === 'fuel')
    if (!fuel.amount && useFuel)
      return {
        ok: false,
      }

    let ok = true,
      message

    const currentLocation = [ship.location[0] || 0, ship.location[1] || 0]
    const startedOOB = ship.isOOB()
    const currentBearing = bearingToRadians(ship.bearing || [0, 1])
    let distanceToTravel = ship.effectiveSpeed() || 0
    if (coordinates) {
      const a = ship.location[0] - coordinates[0],
        b = ship.location[1] - coordinates[1]
      distanceToTravel = Math.sqrt(a * a + b * b)
    }
    const fuelLoss = useFuel ? ship.fuelUsePerTick() : 0

    if (coordinates) ship.location = coordinates
    else {
      const newX =
        currentLocation[0] + distanceToTravel * Math.cos(currentBearing)
      const newY =
        currentLocation[1] + distanceToTravel * Math.sin(currentBearing)
      ship.location = [newX, newY]
    }

    const endedOOB = ship.isOOB()
    if (startedOOB && !endedOOB)
      message = `Your ship has reentered known space.`
    if (!startedOOB && endedOOB)
      message = `Your ship has left the realms of known space. There's nothing but the void to be found out here.`

    fuel.amount -= fuelLoss
    if (fuel.amount <= 0) {
      fuel.amount = 0
      ship.status.stranded = true
      ok = false
      message = story.fuel.insufficient()
    } else {
      ship.status.stranded = false
    }

    return {
      ok,
      distanceTraveled: distanceToTravel,
      message,
    }
  }

  guild.ship.getTotalWeight = () => {
    const equipmentWeight = Object.keys(guild.ship.equipment).reduce(
      (t, eqType) => {
        const typeWeight = guild.ship.equipment[eqType].reduce(
          (total, eq) => total + (eq.weight || 0),
          0,
        )
        return t + typeWeight
      },
      0,
    )
    const cargoWeight = guild.ship.cargo.reduce(
      (total, c) => total + Math.abs(c.amount || 0),
      0,
    )
    const totalWeight = guild.ship.weight + equipmentWeight + cargoWeight

    return totalWeight
  }

  guild.ship.getDirectionString = () => {
    const arrow = bearingToArrow(guild.ship.bearing)
    const degrees = bearingToDegrees(guild.ship.bearing)
    return arrow + ' ' + degrees.toFixed(0) + ' degrees'
  }

  guild.ship.maxSpeed = () => {
    const rawMaxSpeed = guild.ship.equipment.engine.reduce(
      (total, engine) => engine.maxSpeed + total,
      0,
    )

    let percentOfMaxShipWeight =
      guild.ship.getTotalWeight() / guild.ship.maxWeight
    if (percentOfMaxShipWeight > 1) percentOfMaxShipWeight = 1

    return rawMaxSpeed * (1 - percentOfMaxShipWeight)
  }

  guild.ship.redirect = (aggregate = []) => {
    if (!aggregate.length)
      return {
        ok: false,
      }
    const directionVector = getShipDirectionFromAggregate(aggregate)
    // const previousBearing = guild.ship.bearing
    guild.ship.bearing = directionVector
    guild.saveNewDataToDb()
    const arrow = bearingToArrow(directionVector)
    const degrees = bearingToDegrees(directionVector)
    guild.ship.logEntry(
      story.move.redirect.success(degrees, arrow, aggregate.length),
    )
    return {
      ok: true,
      arrow,
      degrees,
    }
  }
}

function getShipSpeedFromAggregate(aggregate) {
  // aggregate is in form [{speed: 0..1, weight: 0..1}]
  const totalWeight = aggregate.reduce(
    (total, current) => (total += current.weight),
    0,
  )
  const speedNormalized =
    aggregate.reduce(
      (total, current) => (total += current.speed * current.weight),
      0,
    ) / totalWeight

  const newSpeed = speedNormalized
  return {
    voteResult: speedNormalized * 10,
    newSpeed,
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
