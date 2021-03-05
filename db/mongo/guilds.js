const { Guild, Ship, CrewMember } = require(`./models`)
const { add: addShip } = require(`./ships`)

module.exports = {
  async getAll() {
    const guilds = await Guild.find({})
    for (let guild of guilds) {
      const ship = await Ship.findOne({ _id: guild.shipId[0] })
      guild.ship = ship
      const members = []
      for (let id of Object.values(guild.members))
        members.push(await CrewMember.findOne({ _id: id }))
      guild.ship.members = members
    }
    return guilds
  },

  async get({ id }) {
    const guild = await Guild.findOne({ _id: id })
    if (!guild) return
    const ship = await Ship.findOne({ _id: guild.shipIds[0] })
    guild.ship = ship
    const members = []
    for (let id of Object.values(guild.members))
      members.push(await CrewMember.findOne({ _id: id }))
    guild.ship.members = members
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
    await Guild.findOneAndUpdate({ _id: id }, { ...updates }, (e, res) => {
      if (e) console.log(`error updating guild:`, e)
      // console.log('guild update result:', res)
    })
  },

  async remove(id) {
    await Guild.deleteOne({ _id: id }, (e) =>
      console.log(`guild delete error`, e),
    )
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
    await g.save()
  },
}
