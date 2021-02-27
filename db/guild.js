const admin = require(`firebase-admin`)

let db

module.exports = function (passedDb) {
  if (passedDb) db = passedDb
  return {
    async getAll() {
      try {
        const snapshot = await db
          .collection(`guilds`)
          .where(`active`, `==`, true)
          .get()
        if (snapshot.empty) return []

        const guilds = []
        snapshot.forEach((doc) => {
          guilds.push(doc.data())
        })
        return guilds
      } catch (e) {
        errorHandler(e)
      }
    },

    async get({ guildId }) {
      try {
        const document = db.doc(`guilds/${guildId}`)
        const doc = await document.get()
        const data = doc.data()
        if (data) return data
      } catch (e) {
        errorHandler(e)
      }
    },

    async add({ guildId, data }) {
      try {
        const document = db.doc(`guilds/${guildId}`)
        await document.set(data)
        console.log(`Added guild to database: ${guildId}`)
      } catch (e) {
        errorHandler(e)
      }
    },

    async update({ guildId, updates }) {
      try {
        // console.log(updates)
        const document = db.doc(`guilds/${guildId}`)
        await document.update(updates)
      } catch (e) {
        errorHandler(e)
      }
    },

    async remove(guildId) {
      try {
        const document = db.doc(`guilds/${guildId}`)
        await document.delete()
      } catch (e) {
        errorHandler(e)
      }
    },

    async getSettings({ guildId }) {
      try {
        const document = db.doc(`guilds/${guildId}`)
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

    async setSettings({ guildId, settings }) {
      try {
        const document = db.doc(`guilds/${guildId}`)
        const existingSettings = await this.getGuildSettings({ guildId })
        const newSettings = existingSettings
        for (const prop in settings) newSettings[prop] = settings[prop]
        await document.update({ settings: newSettings })
      } catch (e) {
        errorHandler(e)
      }
    },

    async addCrewMember({ guildId, member }) {
      try {
        const document = db.doc(`guilds/${guildId}`)
        await document.update({
          'ship.members': admin.firestore.FieldValue.arrayUnion(member),
        })
      } catch (e) {
        errorHandler(e)
      }
    },

    async updateCrewMembers({ guildId, members }) {
      try {
        const document = db.doc(`guilds/${guildId}`)
        await document.update({ 'ship.members': members })
      } catch (e) {
        errorHandler(e)
      }
    },
  }
}

function errorHandler(e) {
  console.log(e.code, e.details, e.metadata, e.note)
}
