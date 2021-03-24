const { Cache } = require(`./models`)
const mongoose = require(`mongoose`)

module.exports = {
  async getAll() {
    return (await Cache.find({})).map((c) => c.toObject())
  },

  async add(data) {
    const cache = new Cache({ ...data, _id: `${mongoose.Types.ObjectId()}` })
    await cache.save()
    return cache
  },

  async remove(id) {
    const res = await Cache.deleteOne(
      { _id: id },
      (e) => e && console.log(`cache delete error`, e),
    )
    return {
      ok: res.deletedCount,
      message: `Deleted ` + res.deletedCount + ` cache/s.`,
    }
  },

  async update({ id, updates }) {
    updates = { ...updates }
    const cache = await Cache.findOne({ _id: id })
    delete updates.id
    delete updates._id
    delete updates.__v
    Object.keys(updates).forEach((key) => (cache[key] = updates[key]))
    await cache.save()
    // console.log(`cache update result`, cache)
    return cache
  },
}
