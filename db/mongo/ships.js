const { Ship } = require(`./models`)

module.exports = {
  async add({ data }) {
    const ship = new Ship({ ...data })
    await ship.save()
    return ship
  },
}
