const { AttackRemnant } = require(`./models`)
const mongoose = require(`mongoose`)

module.exports = {
  async getAll() {
    return (await AttackRemnant.find({})).map((c) => c.toObject())
  },

  async add(data) {
    const attackRemnant = new AttackRemnant({
      ...data,
      _id: `${mongoose.Types.ObjectId()}`,
    })
    await attackRemnant.save()
    return attackRemnant
  },

  async remove(id) {
    const res = await AttackRemnant.deleteOne(
      { _id: id },
      (e) => e && console.log(`attackRemnant delete error`, e),
    )
    return {
      ok: res.deletedCount,
      message: `Deleted ` + res.deletedCount + ` attack remnant/s.`,
    }
  },
}
