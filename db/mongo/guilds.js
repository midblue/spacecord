const { Guild, Ship } = require(`./models`)

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
    const s = new Ship({ ...data.ship })
    await s.save()
    const g = new Guild({ ...data, id, shipId: s._id })
    await g.save()
    // console.log(`Added guild and ship to database: ${id}`, g, s)
  },

  async update({ id, updates }) {
    return console.log(`skipping db update`)
    // try {
    //   console.log(`updates`, updates)
    //   const document = db.doc(`guilds/${id}`)
    //   await document.update(updates)
    // } catch (e) {
    //   errorHandler(e)
    // }
  },

  async remove(id) {
    return console.log(`skipping db remove`)
    // try {
    //   const document = db.doc(`guilds/${id}`)
    //   await document.delete()
    // } catch (e) {
    //   errorHandler(e)
    // }
  },

  async getSettings({ id }) {
    const g = await this.get({ id })
    if (!g) return {}
    return g.settings
    // try {
    //   const document = db.doc(`guilds/${id}`)
    //   const doc = await document.get()
    //   const data = doc.data()
    //   if (!data) return defaultServerSettings
    //   const settings = {
    //     ...defaultServerSettings,
    //     ...(data.settings || {}),
    //   }
    //   return settings
    // } catch (e) {
    //   errorHandler(e)
    // }
  },

  async setSettings({ id, settings }) {
    const g = await this.get({ id })
    if (!g) return {}
    g.settings = settings
    g.save()
    // try {
    //   const document = db.doc(`guilds/${id}`)
    //   const existingSettings = await this.getGuildSettings({
    //     id,
    //   })
    //   const newSettings = existingSettings
    //   for (const prop in settings) newSettings[prop] = settings[prop]
    //   await document.update({ settings: newSettings })
    // } catch (e) {
    //   errorHandler(e)
    // }
  },

  async addCrewMember({ id, member }) {
    return console.log(`skipping db addCrewMember`)
    // try {
    //   const document = db.doc(`guilds/${id}`)
    //   await document.update({
    //     'ship.members': admin.firestore.FieldValue.arrayUnion(member),
    //   })
    // } catch (e) {
    //   errorHandler(e)
    // }
  },

  async updateCrewMembers({ id, members }) {
    return console.log(`skipping db updateCrewMembers`)
    // try {
    //   const document = db.doc(`guilds/${id}`)
    //   await document.update({ 'ship.members': members })
    // } catch (e) {
    //   errorHandler(e)
    // }
  },
}

function errorHandler(e) {
  console.log(e)
}
