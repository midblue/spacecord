module.exports = (guild) => {
  guild.ship.jettison = (cargo, amount, message) => {
    if (cargo.type === 'credits') {
      guild.ship.credits -= amount
      if (guild.ship.credits < 0.0001) guild.ship.credits = 0
    } else {
      cargo.amount -= amount
      if (cargo.amount < 0.0001) cargo.amount = 0
    }
    guild.context.spawnCache({
      type: cargo.type,
      amount,
      location: [...guild.ship.location],
      message,
      shipName: guild.ship.name,
    })
  }

  guild.ship.jettisonAll = () => {
    if (guild.ship.credits) {
      guild.context.spawnCache({
        type: 'credits',
        amount: guild.ship.credits,
        location: [...guild.ship.location],
      })
      guild.ship.credits = 0
    }
    guild.ship.cargo.forEach((cargo) => {
      guild.context.spawnCache({
        type: cargo.type,
        amount: cargo.amount,
        location: [...guild.ship.location],
      })
    })
    guild.ship.cargo = []
  }
}
