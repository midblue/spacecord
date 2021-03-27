module.exports = (guild) => {
  guild.ship.jettison = async (cargo, amount, message) => {
    console.log(cargo)
    if (cargo.type === `credits`) {
      guild.ship.credits -= amount
      if (guild.ship.credits < 0.0001) guild.ship.credits = 0
    } else {
      cargo.amount -= amount
      if (cargo.amount < 0.0001) cargo.amount = 0
    }
    await guild.context.spawnCache({
      type: cargo.cargoType,
      amount,
      location: [...guild.ship.location],
      message,
      shipName: guild.ship.name,
    })
  }

  guild.ship.jettisonAll = async (percent = 1) => {
    if (guild.ship.credits) {
      await guild.context.spawnCache({
        type: `credits`,
        amount: Math.round(guild.ship.credits * percent),
        location: [...guild.ship.location],
      })
      guild.ship.credits = 0
    }
    for (let cargo of guild.ship.cargo) {
      await guild.context.spawnCache({
        type: cargo.cargoType,
        amount: cargo.amount * percent,
        location: [...guild.ship.location],
      })
    }
    guild.ship.cargo = []
  }
}
