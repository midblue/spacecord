const { Guild, Ship, CrewMember } = require(`./models`)
const { add: addShip, remove: removeShip } = require(`./ship`)
const { remove: removeCrewMember } = require(`./crewMember`)

module.exports = {
  async getAll() {
    const guilds = await Guild.find({})
    const guildObjects = []
    for (let guild of guilds) {
      guildObjects.push(await getGuildObjectForGame(guild))
    }
    return guildObjects.filter((go) => go.ship)
  },

  async get({ id }) {
    const guild = await Guild.findOne({ _id: id })
    return await getGuildObjectForGame(guild)
  },

  async getRaw({ id }) {
    return await Guild.findOne({ _id: id })
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
    updates = { ...updates }
    // console.log(`updating`, id, updates)
    const guild = await Guild.findOne({ _id: id })
    if (!guild)
      return console.log(`Attempted to update a guild that does not exist:`, id)
    delete updates.id
    delete updates._id
    delete updates.__v
    Object.keys(updates).forEach((key) => (guild[key] = updates[key]))
    await guild.save()
    // console.log(`guild update result`, guild)
    return guild
  },

  async remove(id) {
    const guild = await Guild.findOne({ _id: id })
    for (let m of guild.members) await removeCrewMember(m.crewMemberId)
    for (let sId of guild.shipIds) await removeShip(sId)
    const res = await Guild.deleteOne(
      { _id: id },
      (e) => e && console.log(`guild delete error`, e),
    )
    console.log(res)
    return {
      ok: res.ok,
      message: `Deleted ` + (res.ok ? 1 : 0) + ` guild/s.`,
    }
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

async function getGuildObjectForGame(guild) {
  if (!guild) return
  if (guild.toObject) guild = guild.toObject()
  const ship = await Ship.findOne({ _id: guild.shipIds[0] })
  if (ship) guild.ship = ship.toObject()
  else return guild
  const members = []
  for (let m of Object.values(guild.members)) {
    const foundMember = await CrewMember.findOne({ _id: m.crewMemberId })
    if (foundMember)
      members.push({
        ...foundMember.toObject(),
        crewMemberId: foundMember.id,
        id: foundMember.userId, // * this is for general usage in the app — makes things easier to call them by their user id
      })
  }
  guild.ship.members = members
  return guild
}
