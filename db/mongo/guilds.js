const { Guild } = require(`./models`)
const { add: addShip } = require(`./ships`)

module.exports = {
  async getAll() {
    const guilds = await Guild.find({})
    return guilds
  },

  async get({ id }) {
    const guild = await Guild.findOne({ _id: id })
    return guild
  },

  async add({ id, data }) {
    const ship = await addShip({ data: data.ship, guildId: id })
    const guild = new Guild({ ...data, id, shipIds: [ship._id] })
    await guild.save()
    return guild
    // console.log(`Added guild and ship to database: ${id}`, g, s)
  },

  async update({ id, updates }) {
    Guild.findOneAndUpdate({ _id: id }, { ...updates }, (e, res) => {
      if (e) console.log(`error updating guild:`, e)
      // console.log('guild update result:', res)
    })
  },

  async remove(id) {
    Guild.deleteOne({ _id: id }, (e) => console.log(`cache delete error`, e))
  },

  async getSettings({ id }) {
    const g = await this.get({ id })
    if (!g) return {}
    return g.settings
  },

  async setSettings({ id, settings }) {
    const g = await this.get({ id })
    if (!g) return
    g.settings = settings
    g.save()
  },
}
