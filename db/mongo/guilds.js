const { Guild } = require(`./models`)

module.exports = {
  async getAll() {
    const guilds = await Guild.find({})
    return guilds
  },

  async get({ id }) {
    const guild = await Guild.findOne({ id })
    return guild
  },

  async add({ id, data }) {
    console.log(data)
    const g = new Guild({ data, id })
    await g.save()
    console.log(`Added guild to database: ${id}`)
  },

  async update({ id, updates }) {
    try {
      // console.log(updates)
      const document = db.doc(`guilds/${id}`)
      await document.update(updates)
    } catch (e) {
      errorHandler(e)
    }
  },

  async remove(id) {
    try {
      const document = db.doc(`guilds/${id}`)
      await document.delete()
    } catch (e) {
      errorHandler(e)
    }
  },

  async getSettings({ id }) {
    try {
      const document = db.doc(`guilds/${id}`)
      const doc = await document.get()
      const data = doc.data()
      if (!data) return defaultServerSettings
      const settings = {
        ...defaultServerSettings,
        ...(data.settings || {}),
      }
      return settings
    } catch (e) {
      errorHandler(e)
    }
  },

  async setSettings({ id, settings }) {
    try {
      const document = db.doc(`guilds/${id}`)
      const existingSettings = await this.getGuildSettings({
        id,
      })
      const newSettings = existingSettings
      for (const prop in settings)
        newSettings[prop] = settings[prop]
      await document.update({ settings: newSettings })
    } catch (e) {
      errorHandler(e)
    }
  },

  async addCrewMember({ id, member }) {
    try {
      const document = db.doc(`guilds/${id}`)
      await document.update({
        'ship.members': admin.firestore.FieldValue.arrayUnion(
          member,
        ),
      })
    } catch (e) {
      errorHandler(e)
    }
  },

  async updateCrewMembers({ id, members }) {
    try {
      const document = db.doc(`guilds/${id}`)
      await document.update({ 'ship.members': members })
    } catch (e) {
      errorHandler(e)
    }
  },
}

function errorHandler(e) {
  console.log(e)
}
