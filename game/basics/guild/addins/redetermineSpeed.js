module.exports = (guild) => {
  guild.ship.redetermineSpeed = (aggregate = []) => {
    if (!aggregate.length)
      return {
        ok: false,
      }
    const { voteResult, newSpeed } = getShipSpeedFromAggregate(aggregate, guild)
    const previousSpeed = guild.ship.speed
    guild.ship.speed = newSpeed
    return {
      ok: true,
      newSpeed,
      previousSpeed,
      voteResult,
    }
  }
}

function getShipSpeedFromAggregate(aggregate, guild) {
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
  const newSpeed = speedNormalized * guild.ship.maxSpeed()
  return {
    voteResult: speedNormalized * 10,
    newSpeed,
  }
}
