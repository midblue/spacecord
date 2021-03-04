const { Ship } = require(`./models`)

module.exports = {
  async get({ id }) {
    const ship = await Ship.findOne({ _id: id })
    return ship
  },
  async add({ data, guildId }) {
    const ship = new Ship({ ...data, guildId })
    await ship.save()
    return ship
  },
}
