const defaultServerSettings = require('../discord/defaults/defaultServerSettings')

module.exports = function (passedFirestore) {
  if (passedFirestore) firestore = passedFirestore
  return {
    async get({ guildId }) {
      const document = firestore.doc(`guilds/${guildId}`)
      const doc = await document.get()
      const data = doc.data()
      if (data) return data
    },

    async add({ guildId, data }) {
      const document = firestore.doc(`guilds/${guildId}`)
      const newData = {
        ...data,
        settings: defaultServerSettings,
      }
      await document.set(newData)
      console.log(`Added guild to database: ${guildId}`)
      return newData
    },

    async getSettings({ guildId }) {
      const document = firestore.doc(`guilds/${guildId}`)
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
      const document = firestore.doc(`guilds/${guildId}`)
      const existingSettings = await this.getGuildSettings({ guildId })
      const newSettings = existingSettings
      for (let prop in settings) newSettings[prop] = settings[prop]
      await document.update({ settings: newSettings })
    },
  }
}
