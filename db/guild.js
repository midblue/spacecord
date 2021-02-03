const admin = require('firebase-admin')

let db

module.exports = function (passedDb) {
  if (passedDb) db = passedDb
  return {
    async getAll() {
      const snapshot = await db.collection('guilds').get()
      if (snapshot.empty) return

      const guilds = []
      snapshot.forEach((doc) => {
        guilds.push(doc.data())
      })
      return guilds
    },

    async get({ guildId }) {
      const document = db.doc(`guilds/${guildId}`)
      const doc = await document.get()
      const data = doc.data()
      if (data) return data
    },

    async add({ guildId, data }) {
      const document = db.doc(`guilds/${guildId}`)
      await document.set(data)
      console.log(`Added guild to database: ${guildId}`)
    },

    async update({ guildId, updates }) {
      const document = db.doc(`guilds/${guildId}`)
      await document.update(updates)
    },

    async remove(guildId) {
      const document = db.doc(`guilds/${guildId}`)
      await document.delete()
    },

    async getSettings({ guildId }) {
      const document = db.doc(`guilds/${guildId}`)
      const doc = await document.get()
      const data = doc.data()
      if (!data) return defaultServerSettings
      const settings = {
        ...defaultServerSettings,
        ...(data.settings || {}),
      }
      return settings
    },

    async setSettings({ guildId, settings }) {
      const document = db.doc(`guilds/${guildId}`)
      const existingSettings = await this.getGuildSettings({ guildId })
      const newSettings = existingSettings
      for (let prop in settings) newSettings[prop] = settings[prop]
      await document.update({ settings: newSettings })
    },

    async addCrewMember({ guildId, member }) {
      const document = db.doc(`guilds/${guildId}`)
      await document.update({
        'ship.members': admin.firestore.FieldValue.arrayUnion(member),
      })
    },

    async updateCrewMembers({ guildId, members }) {
      const document = db.doc(`guilds/${guildId}`)
      await document.update({
        'ship.members': members,
      })
    },
  }
}
