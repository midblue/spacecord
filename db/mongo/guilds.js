const { Guild } = require(`./models`)

module.exports = {
  async getAll () {
    const guilds = await Guild.find({})
    return guilds
  },

  async get ({ guildId }) {
    const guild = await Guild.findOne({ guildId: guildId })
    return guild
  },

  async add ({
    guildId,
    data
  }) {
    const g = new Guild({ data, guildId: guildId })
    await g.save()
    console.log(`Added guild to database: ${guildId}`)
  },

  async update ({
    guildId,
    updates
  }) {
    try {
      // console.log(updates)
      const document = db.doc(`guilds/${guildId}`)
      await document.update(updates)
    }
    catch (e) {
      errorHandler(e)
    }
  },

  async remove (guildId) {
    try {
      const document = db.doc(`guilds/${guildId}`)
      await document.delete()
    }
    catch (e) {
      errorHandler(e)
    }
  },

  async getSettings ({ guildId }) {
    try {
      const document = db.doc(`guilds/${guildId}`)
      const doc = await document.get()
      const data = doc.data()
      if (!data)
        return defaultServerSettings
      const settings = {
        ...defaultServerSettings,
        ...(data.settings || {})
      }
      return settings
    }
    catch (e) {
      errorHandler(e)
    }
  },

  async setSettings ({
    guildId,
    settings
  }) {
    try {
      const document = db.doc(`guilds/${guildId}`)
      const existingSettings = await this.getGuildSettings({ guildId })
      const newSettings = existingSettings
      for (const prop in settings)
        newSettings[prop] = settings[prop]
      await document.update({ settings: newSettings })
    }
    catch (e) {
      errorHandler(e)
    }
  },

  async addCrewMember ({
    guildId,
    member
  }) {
    try {
      const document = db.doc(`guilds/${guildId}`)
      await document.update({ 'ship.members': admin.firestore.FieldValue.arrayUnion(member) })
    }
    catch (e) {
      errorHandler(e)
    }
  },

  async updateCrewMembers ({
    guildId,
    members
  }) {
    try {
      const document = db.doc(`guilds/${guildId}`)
      await document.update({ 'ship.members': members })
    }
    catch (e) {
      errorHandler(e)
    }
  }
}

function errorHandler (e) {
  console.log(e)
}
