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
  guild.ship.maxThrust = () => {
    const rawMaxThrust = guild.ship.equipment
      .find((e) => e.equipmentType === `engine`)
      .list.reduce((total, engine) => engine.maxThrust + total, 0)

    return rawMaxThrust
  }

  guild.ship.getVelocityFromThrustVector = ({ power, angle }) => {
    const thrustAngleVector = degreesToUnitVector(angle)
    const maxThrustFromEngines = guild.ship.maxThrust()

    const thrustMagnitude =
      (maxThrustFromEngines * power) / guild.ship.getTotalMass()

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

    // determine amplification based on skill level
    const crewMemberPilotingSkill = thruster.skillLevelDetails(
      `piloting`,
    ).level
    const engineRequirements =
      guild.ship.getRequirements(`engine`).requirements.piloting || 1
    const thrustAmplification = Math.max(
      0.1,
      Math.min(3, crewMemberPilotingSkill / engineRequirements),
    )
    power *= thrustAmplification

    const fuel = guild.ship.cargo.find((c) => c.cargoType === `fuel`)
    if (!fuel.amount) return { ok: false, message: story.fuel.insufficient() }
    const prevSpeedString = guild.ship.getSpeedString(),
      prevDirectionString = guild.ship.getDirectionString()

    const velocityFromThrustVector = guild.ship.getVelocityFromThrustVector({
      power,
      angle,
    })
    guild.ship.velocity[0] +=
      velocityFromThrustVector[0] / guild.ship.getTotalMass()
    guild.ship.velocity[1] +=
      velocityFromThrustVector[1] / guild.ship.getTotalMass()
    // console.log(ship.velocity, velocityFromThrustVector, guild.ship.getTotalMass())
    const velocityFromThrustMagnitude = Math.sqrt(
      velocityFromThrustVector[0] ** 2 + velocityFromThrustVector[1] ** 2,
    )
    const thrustUnitVector = degreesToUnitVector(angle)
    message.push(
      story.move.thrust(
        velocityFromThrustMagnitude,
        angle,
        guild,
        thruster,
        prevSpeedString,
        prevDirectionString,
      ),
    )

    const resourceRes = guild.ship.useMoveResources(
      power,
      velocityFromThrustMagnitude,
    )
    message.push(...resourceRes.message)
    ok = ok && resourceRes.ok

    guild.ship.pastLocations.push([...guild.ship.location])

    guild.saveToDb()
    return { message, ok, thrustUnitVector }
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

    return Math.sqrt(guild.ship.velocity[0] ** 2 + guild.ship.velocity[1] ** 2)
  }

  guild.ship.isOOB = () => {
    return (
      distance(0, 0, ...guild.ship.location) > guild.context.gameDiameter() / 2
    )
  }

  guild.ship.hardStop = () => {
    guild.ship.velocity = [0, 0]
    guild.saveToDb()
  }

  guild.ship.move = (coordinates) => {
    const ship = guild.ship

    let ok = true
    let message = []

    const currentLocation = ship.location
    const startedOOB = ship.isOOB()
    const startLocation = [...ship.location]

    // force = dp / dt
    // force_for_x_ticks = dp / dt * time / tick = dp / tick
    // force * length_of_tick = p = m * v
    // v = force * length_of_tick / ship_mass

    if (coordinates) ship.location = coordinates
    else {
      let planetsInRange = guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range: GRAVITY_RANGE,
        type: `planets`,
      }).planets

      // console.log(
      //   `ship is at`,
      //   ship.location,
      //   `with velocity`,
      //   ship.velocity,
      //   `which has angle`,
      //   (360 + (180 * velocityToRadians(ship.velocity)) / Math.PI) % 360,
      // )
      const shipMass = guild.ship.getTotalMass()
      for (let planet of planetsInRange) {
        const gravityForceVector = getGravityForceVectorOnThisBodyDueToThatBody(
          {
            ...ship,
            mass: shipMass,
          },
          planet,
        )

        ship.velocity[0] +=
          gravityForceVector[0] / shipMass / KM_PER_AU / M_PER_KM
        ship.velocity[1] +=
          gravityForceVector[1] / shipMass / KM_PER_AU / M_PER_KM

        // if we hit the planet
        if (distance(guild.ship, planet) <= planet.radius / KM_PER_AU) {
          const landRes = guild.ship.land({ planet })
          guild.message(landRes.message)
          break
        }

        // if (gravityForceVector.reduce((t, c) => t + Math.abs(c), 0) > 0.01)
        //   console.log(
        //     `planet ${planet.name} at`,
        //     planet.location,
        //     `has`,
        //     gravityForceVector.map((v) => v / shipMass / KM_PER_AU / M_PER_KM),
        //     `effect on ship at`,
        //     ship.location,
        //   )
      }

      if (!ship.status.docked) {
        const newX = currentLocation[0] + ship.velocity[0]
        const newY = currentLocation[1] + ship.velocity[1]
        ship.location = [newX, newY]
      }

      guild.ship.moveCount = (guild.ship.moveCount || 0) + 1
      if (guild.ship.moveCount % 120 === 0) {
        guild.ship.moveCount = 0
        ship.pastLocations.push([...ship.location])
        while (ship.pastLocations.length > 100) ship.pastLocations.shift()
      }
    }

    // check if we discovered any new planets
    const scanResult = guild.context.scanArea({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range: guild.ship.interactRadius() || 0,
      type: `planets`,
    })
    for (let p of scanResult.planets) {
      const seenPlanets = guild.ship.seen.planets
      if (!seenPlanets.find((sp) => sp === p.name)) {
        seenPlanets.push(p.name)
        guild.ship.logEntry(story.discovery.planet(p))
        message.push(story.discovery.planet(p))
      }
    }

    const endedOOB = ship.isOOB()
    if (startedOOB && !endedOOB) message = story.move.oob.reEnter()
    if (!startedOOB && endedOOB) message = story.move.oob.goOOB()

    return {
      ok,
      distanceTraveled: distance(startLocation, ship.location),
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
