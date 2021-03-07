const { Planet } = require(`./model`)
const mongoose = require(`mongoose`)

module.exports = {
  async add() {
    const planet = new Planet({ _id: `${mongoose.Types.ObjectId()}` })
    await planet.save()
    return planet
  },
}
