let db

module.exports = function (passedDb) {
  if (passedDb) db = passedDb
  return {
    async getAll () {
      try {
        const snapshot = await db.collection(`caches`).get()
        if (snapshot.empty) return []

        const caches = []
        snapshot.forEach((doc) => {
          caches.push({ ...doc.data(), id: doc.id })
        })
        return caches
      } catch (e) {
        errorHandler(e)
      }
    },

    async add (data) {
      try {
        await db.collection(`caches`).add(data)
        console.log(`Added cache to database.`)
      } catch (e) {
        errorHandler(e)
      }
    },

    async remove (cacheId) {
      try {
        const document = db.doc(`caches/${cacheId}`)
        await document.delete()
      } catch (e) {
        errorHandler(e)
      }
    },

    async update ({ cacheId, updateData }) {
      try {
        const document = db.doc(`caches/${cacheId}`)
        await document.update(updateData)
      } catch (e) {
        errorHandler(e)
      }
    }
  }
}

function errorHandler (e) {
  console.log(e.code, e.details, e.metadata, e.note)
}
