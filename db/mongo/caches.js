const { Cache } = require(`./models`)
const updateOptions = { new: true, omitUndefined: true }

module.exports = {
  async getAll() {
    return await Cache.find({})
  },

  async add(data) {
    const cache = new Cache({ ...data })
    await cache.save()
    return cache
  },

  async remove(id) {
    Cache.deleteOne({ _id: id }, (e) => console.log(`cache delete error`, e))
  },

  async update({ cacheId, updateData }) {
    Cache.findOneAndUpdate(
      { _id: cacheId },
      { ...updateData },
      updateOptions,
      (e, res) => {
        if (e) console.log(`error updating cache:`, e)
        // console.log('cache update result:', res)
      },
    )
  },
}
