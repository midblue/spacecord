const { Ship } = require(`./models`)
const mongoose = require(`mongoose`)

module.exports = {
  async get({ id }) {
    const ship = await Ship.findOne({ _id: id })
    return ship.toObject()
  },

  async add({ data, guildId }) {
    const ship = new Ship({
      ...data,
      guildId,
      _id: `${mongoose.Types.ObjectId()}`,
    })
    await ship.save()
    return ship
  },

  async update({ id, updates }) {
    updates = { ...updates }
    const ship = await Ship.findOne({ _id: id })
    delete updates.id
    delete updates._id
    delete updates.__v
    Object.keys(updates).forEach((key) => (ship[key] = updates[key]))
    await ship.save()
    // console.log(`ship update result`, ship)
    return ship
  },

  async remove(id) {
    console.log(`db: removing ship`, id)
    const res = await Ship.deleteOne(
      { _id: id },
      (e) => e && console.log(`ship delete error`, e),
    )
    return {
      ok: res.deletedCount,
      message: `Deleted ` + res.deletedCount + ` ship/s.`,
    }
  },
}
