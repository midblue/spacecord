const maxLogLength = 50
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
    })
  }
}
