const { Guild, Ship, CrewMember } = require(`./models`)
const { add: addShip } = require(`./ships`)
const mongoose = require(`mongoose`)

module.exports = {
  async getAll() {
    const guilds = await Guild.find({})
    for (let guild of guilds) {
      const ship = await Ship.findOne({ _id: guild.shipIds[0] })
      guild.ship = ship
      const members = []
      for (let m of Object.values(guild.members))
        members.push(await CrewMember.findOne({ _id: m.crewMemberId }))
      guild.ship.members = members
    }
    return guilds.map((g) => g.toObject())
  },

  async get({ id }) {
    let guild = await Guild.findOne({ _id: id })
    if (!guild) return
    guild = guild.toObject()
    const ship = await Ship.findOne({ _id: guild.shipIds[0] })
    if (ship) guild.ship = ship.toObject()
    const members = []
    for (let m of Object.values(guild.members)) {
      const foundMember = await CrewMember.findOne({ _id: m.crewMemberId })
      if (foundMember) members.push(foundMember.toObject())
    }
    return guild
  },

  async add({ id, data }) {
    const ship = await addShip({
      data: data.ship,
      guildId: id,
    })
    const guild = new Guild({ ...data, id, shipIds: [ship.id] })
    await guild.save()
    const fullGuild = await this.get({ id })
    // console.log(`Added guild and ship to database: ${id}`, guild, ship)
    return fullGuild
  },

  async update({ id, updates }) {
    const guild = await Guild.findOne({ _id: id })
    delete updates.id
    delete updates._id
    delete updates.__v
    Object.keys(updates).forEach((key) => (guild[key] = updates[key]))
    await guild.save()
    // console.log(`guild update result`, guild)
    return guild
  },

  async remove(id) {
    await Guild.deleteOne({ id: id }, (e) =>
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
