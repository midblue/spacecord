const { Planet } = require(`./models`)
const mongoose = require(`mongoose`)

module.exports = {
  async add() {
    const planet = new Planet({ _id: `${mongoose.Types.ObjectId()}` })
    await planet.save()
    return planet
  },
}
