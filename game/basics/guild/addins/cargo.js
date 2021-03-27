const story = require(`../../story/story`)
module.exports = (guild) => {
  guild.ship.addCargo = async (type, amount, cost) => {
    if (!guild.ship.cargo.find((c) => c.cargoType === type)) {
      guild.ship.cargo.push({ type, amount })
    } else guild.ship.cargo.find((c) => c.cargoType === type).amount += amount
    guild.ship.credits -= cost * amount
  }
  guild.ship.removeCargo = async (type, amount, cost) => {
    const cargo = guild.ship.cargo.find((c) => c.cargoType === type)
    cargo.amount -= amount
    if (cargo.amount < 0) cargo.amount = 0
    guild.ship.credits += cost * amount
  }
}
