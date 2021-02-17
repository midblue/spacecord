const story = require(`../../story/story`)
module.exports = (guild) => {
  guild.ship.addCargo = async (type, amount, cost) => {
    if (!guild.ship.cargo.find((c) => c.type === type)) { guild.ship.cargo.push({ type, amount }) } else guild.ship.cargo.find((c) => c.type === type).amount += amount
    guild.ship.credits -= cost * amount
  }
  guild.ship.removeCargo = async (type, amount, cost) => {
    guild.ship.cargo.find((c) => c.type === type).amount -= amount
    guild.ship.credits += cost * amount
  }
}
