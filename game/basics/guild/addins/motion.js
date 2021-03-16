const story = require(`../../story/story`)
const {
  velocityToRadians,
  velocityToDegrees,
  velocityToArrow,
  distance,
  degreesToUnitVector,
} = require(`../../../../common`)
const {
  getGravityForceVectorOnThisBodyDueToThatBody,
} = require(`../../../gamecommon`)

module.exports = (guild) => {
  // guild.ship.maxSpeed = () => {
  //   const rawMaxSpeed = guild.ship.equipment
  //     .find((e) => e.equipmentType === `engine`)
  //     .list.reduce((total, engine) => engine.maxSpeed + total, 0)

  //   let percentOfMaxShipMass =
  //     guild.ship.getTotalMass() / guild.ship.maxMass()
  //   if (percentOfMaxShipMass > 1) percentOfMaxShipMass = 1

  //   return rawMaxSpeed * (1 - percentOfMaxShipMass)
  // }

  guild.ship.maxThrust = () => {
    const rawMaxThrust = guild.ship.equipment
      .find((e) => e.equipmentType === `engine`)
      .list.reduce((total, engine) => engine.maxThrust + total, 0)

    return rawMaxThrust * 1000
  }

  guild.ship.getVelocityFromThrustVector = ({ power, angle }) => {
    const thrustAngleVector = degreesToUnitVector(angle)
    const maxThrustFromEngines = guild.ship.maxThrust()

    const thrustMagnitude = maxThrustFromEngines * power / guild.ship.getTotalMass()

    const velocityFromThrustVector = [
      thrustAngleVector[0] * thrustMagnitude * -1,
      thrustAngleVector[1] * thrustMagnitude * -1,
    ]

    return velocityFromThrustVector // aU / hour 
  }

  guild.ship.thrust = ({ power, angle, thruster }) => {
    let message = [],
      ok = true
    if (guild.ship.status.docked)
      return { ok: false, message: story.move.docked() }
    const fuel = guild.ship.cargo.find((c) => c.cargoType === `fuel`)
    if (!fuel.amount) return { ok: false, message: story.fuel.insufficient() }
    const prevSpeedString = guild.ship.getSpeedString(),
      prevDirectionString = guild.ship.getDirectionString()

    const velocityFromThrustVector = guild.ship.getVelocityFromThrustVector({ power, angle })
    guild.ship.velocity[0] += velocityFromThrustVector[0] / guild.ship.getTotalMass()
    guild.ship.velocity[1] += velocityFromThrustVector[1] / guild.ship.getTotalMass()
    // console.log(ship.velocity, velocityFromThrustVector, guild.ship.getTotalMass())
    const velocityFromThrustMagnitude = Math.sqrt(
      velocityFromThrustVector[0] ** 2 + velocityFromThrustVector[1] ** 2,
    )
    message.push(story.move.thrust(velocityFromThrustMagnitude, angle, guild, thruster, prevSpeedString, prevDirectionString))

    const resourceRes = guild.ship.useMoveResources(power, velocityFromThrustMagnitude)
    message.push(...resourceRes.message)
    ok = ok && resourceRes.ok

    guild.saveNewDataToDb()
    return { message, ok }
  }

  guild.ship.useMoveResources = (powerPercent, thrustApplied) => {
    let message = [],
      ok = true

    const fuelUsePerUnitOfThrust = (
      guild.ship.equipment.find((e) => e.equipmentType === `engine`).list || []
    ).reduce((total, engine) => {
      return total + (engine.fuelUse || 0)
    }, 0)

    const fuel = guild.ship.cargo.find((c) => c.cargoType === `fuel`)
    const fuelLoss = fuelUsePerUnitOfThrust * thrustApplied

    fuel.amount -= fuelLoss
    if (fuel.amount <= 0) {
      fuel.amount = 0
      guild.ship.status.stranded = true
      ok = false
      message.push(story.fuel.insufficient())
    } else {
      guild.ship.status.stranded = false
    }

    if (!guild.ship.status.stranded) {
      guild.ship.equipment
        .find((e) => e.equipmentType === `engine`)
        .list.forEach((engine) => {
          // durability loss
          engine.repair -= engine.durabilityLostOnUse * powerPercent
          if (engine.repair < 0) {
            engine.repair = 0
            ok = false
            message.push(story.repair.equipment.beakdown(engine))
          }
        })
    }
    return { message, ok }
  }

  guild.ship.effectiveSpeed = () => {
    if (guild.ship.status.docked) return 0

    return Math.sqrt(
      guild.ship.velocity[0] * guild.ship.velocity[0] +
      guild.ship.velocity[1] * guild.ship.velocity[1],
    )
  }

  guild.ship.isOOB = () => {
    return (
      distance(0, 0, ...guild.ship.location) > guild.context.gameDiameter() / 2
    )
  }

  guild.ship.hardStop = () => {
    guild.ship.velocity = [0, 0]
    guild.saveNewDataToDb()
  }

  guild.ship.move = (coordinates) => {
    const ship = guild.ship

    let ok = true
    let message = []

    const currentLocation = ship.location
    const startedOOB = ship.isOOB()
    let distanceToTravel = ship.effectiveSpeed()

    // force = dp / dt
    // force_for_x_ticks = dp / dt * time / tick = dp / tick
    // force * length_of_tick = p = m * v
    // v = force * length_of_tick / ship_mass

    if (coordinates) {
      const a = ship.location[0] - coordinates[0]
      const b = ship.location[1] - coordinates[1]
      distanceToTravel = Math.sqrt(a * a + b * b)
      ship.location = coordinates
    } else {
      let planetsInRange = guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range: GRAVITY_RANGE,
        type: `planets`,
      }).planets

      // console.log(``)
      // console.log(
      //   `ship is at`,
      //   ship.location,
      //   `with velocity`,
      //   ship.velocity,
      //   `which has angle`,
      //   (360 + (180 * velocityToRadians(ship.velocity)) / Math.PI) % 360,
      // )
      const shipMass = guild.ship.getTotalMass()
      for (planet of planetsInRange) {
        const gravityForceVector = getGravityForceVectorOnThisBodyDueToThatBody(
          {
            ...ship,
            mass: shipMass,
          },
          planet,
        )

        ship.velocity[0] += gravityForceVector[0] / shipMass / KM_PER_AU / M_PER_KM
        ship.velocity[1] += gravityForceVector[1] / shipMass / KM_PER_AU / M_PER_KM
        console.log(
          `planet at`,
          planet.location,
          `has`,
          gravityForceVector.map((v) => v / shipMass),
          `effect on ship at`,
          ship.location
        )
      }

      const newX = currentLocation[0] + ship.velocity[0]
      const newY = currentLocation[1] + ship.velocity[1]
      ship.location = [newX, newY]

      // const previousLocation = ship.pastLocations[ship.pastLocations.length - 1]
      // if (!previousLocation || (distance(ship.location, previousLocation) > 0.05)) { // magic number! lower to increase map fidelity
      ship.pastLocations.push([...ship.location])
      while (ship.pastLocations.length > 200) ship.pastLocations.shift()
      // }
      // console.log(ship.location, velocityToDegrees(ship.velocity))
    }

    // check if we discovered any new planets
    const scanResult = guild.context.scanArea({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range: guild.ship.interactRadius() || 0,
      type: `planets`,
    })
    for (const planet of scanResult.planets) {
      const seenPlanets = guild.ship.seen.planets
      if (!seenPlanets.find((p) => p === planet.name)) {
        seenPlanets.push(planet.name)
        guild.ship.logEntry(story.discovery.planet(planet))
        message.push(story.discovery.planet(planet))
      }
    }

    const endedOOB = ship.isOOB()
    if (startedOOB && !endedOOB) message = story.move.oob.reEnter()
    if (!startedOOB && endedOOB) message = story.move.oob.goOOB()

    return {
      ok,
      distanceTraveled: distanceToTravel,
      message,
    }
  }

  guild.ship.getDirectionString = () => {
    const arrow = velocityToArrow(guild.ship.velocity)
    const degrees = velocityToDegrees(guild.ship.velocity)
    return arrow + ` ` + degrees.toFixed(0) + ` degrees`
  }
  guild.ship.getSpeedString = () => {
    return `${Math.round(guild.ship.effectiveSpeed() * TICKS_PER_HOUR * 10000) / 10000
      } ${DISTANCE_UNIT}/hour`
  }
}

// guild.ship.getAvailableSpeedLevels = () => {
//   const availableSpeedLevels = []

//   const bestShipSpeedLevels = guild.ship.equipment
//     .find((e) => e.equipmentType === `engine`)
//     .list.reduce((max, engine) => Math.max(max, engine.powerLevels || 0), 2)

//   availableSpeedLevels.push({ emoji: `🔟`, speed: 1 })
//   if (bestShipSpeedLevels > 1) {
//     availableSpeedLevels.push({ emoji: `0️⃣`, speed: 0 })
//   }
//   if (bestShipSpeedLevels > 2) {
//     availableSpeedLevels.push({ emoji: `5️⃣`, speed: 0.5 })
//   }
//   if (bestShipSpeedLevels > 3) {
//     availableSpeedLevels.push({ emoji: `7️⃣`, speed: 0.7 })
//   }
//   if (bestShipSpeedLevels > 4) {
//     availableSpeedLevels.push({ emoji: `2️⃣`, speed: 0.2 })
//   }
//   if (bestShipSpeedLevels > 5) {
//     availableSpeedLevels.push({ emoji: `1️⃣`, speed: 0.1 })
//   }
//   if (bestShipSpeedLevels > 6) {
//     availableSpeedLevels.push({ emoji: `9️⃣`, speed: 0.9 })
//   }
//   if (bestShipSpeedLevels > 7) {
//     availableSpeedLevels.push({ emoji: `4️⃣`, speed: 0.4 })
//   }
//   if (bestShipSpeedLevels > 8) {
//     availableSpeedLevels.push({ emoji: `8️⃣`, speed: 0.8 })
//   }
//   if (bestShipSpeedLevels > 9) {
//     availableSpeedLevels.push({ emoji: `3️⃣`, speed: 0.3 })
//   }
//   if (bestShipSpeedLevels > 10) {
//     availableSpeedLevels.push({ emoji: `6️⃣`, speed: 0.6 })
//   }

//   return availableSpeedLevels
// }

// guild.ship.getAvailableDirections = () => {
//   const availableDirections = []

//   const bestShipDirections = guild.ship.equipment
//     .find((e) => e.equipmentType === `engine`)
//     .list.reduce((max, engine) => Math.max(max, engine.directions || 0), 4)

//   if (bestShipDirections === 3) {
//     return [
//       { emoji: `↗️`, vector: [1, 1] },
//       { emoji: `↖️`, vector: [-1, 1] },
//       { emoji: `⬇️`, vector: [0, -1.414] },
//     ]
//   }
//   availableDirections.push({ emoji: `➡️`, vector: [1.414, 0] })
//   if (bestShipDirections > 4) {
//     availableDirections.push({ emoji: `↗️`, vector: [1, 1] })
//   }
//   availableDirections.push({ emoji: `⬆️`, vector: [0, 1.414] })
//   if (bestShipDirections > 5) {
//     availableDirections.push({ emoji: `↖️`, vector: [-1, 1] })
//   }
//   availableDirections.push({ emoji: `⬅️`, vector: [-1.414, 0] })
//   if (bestShipDirections > 6) {
//     availableDirections.push({ emoji: `↙️`, vector: [-1, -1] })
//   }
//   availableDirections.push({ emoji: `⬇️`, vector: [0, -1.414] })
//   if (bestShipDirections > 7) {
//     availableDirections.push({ emoji: `↘️`, vector: [1, -1] })
//   }

// guild.ship.redirect = (aggregate = []) => {
//   if (!aggregate.length) {
//     return { ok: false }
//   }
//   const directionVector = getShipDirectionFromAggregate(aggregate)
//   // const previousVelocity = guild.ship.velocity
//   guild.ship.velocity = directionVector
//   guild.saveNewDataToDb()
//   const arrow = velocityToArrow(directionVector)
//   const degrees = velocityToDegrees(directionVector)
//   guild.ship.logEntry(
//     story.move.redirect.success(degrees, arrow, aggregate.length),
//   )
//   return {
//     ok: true,
//     arrow,
//     degrees,
//   }
// }

// guild.ship.redetermineSpeed = (aggregate = []) => {
//   if (!aggregate.length) {
//     return { ok: false }
//   }
//   const { voteResult, newSpeed } = getShipSpeedFromAggregate(aggregate, guild)
//   const previousSpeed = guild.ship.speed
//   if (previousSpeed !== newSpeed) {
//     guild.ship.speed = newSpeed
//     guild.ship.logEntry(
//       story.move.adjustSpeed.success(
//         newSpeed > previousSpeed,
//         newSpeed,
//         voteResult / 10,
//         aggregate.length,
//       ),
//     )
//     guild.saveNewDataToDb()
//   }
//   return {
//     ok: true,
//     newSpeed,
//     previousSpeed,
//     voteResult,
//   }
// }

//   return availableDirections
// }
// function getShipSpeedFromAggregate(aggregate) {
//   // aggregate is in form [{speed: 0..1, mass: Number}]
//   const totalMass = aggregate.reduce(
//     (total, current) => (total += current.mass),
//     0,
//   )
//   const speedNormalized = aggregate.reduce(
//     (total, current) =>
//       (total += current.speed * (current.mass / totalMass)),
//     0,
//   )

//   const newSpeed = speedNormalized
//   return {
//     voteResult: speedNormalized * 10,
//     newSpeed,
//   }
// }

// function getShipDirectionFromAggregate(aggregate) {
//   // aggregate is in form [{vector: [x, y], mass: 0..1}]
//   const totalMass = aggregate.reduce(
//     (total, current) => (total += current.mass),
//     0,
//   )
//   const xVector =
//     aggregate.reduce(
//       (total, current) => (total += current.vector[0] * current.mass),
//       0,
//     ) / totalMass
//   const yVector =
//     aggregate.reduce(
//       (total, current) => (total += current.vector[1] * current.mass),
//       0,
//     ) / totalMass
//   return [xVector, yVector]
// }
