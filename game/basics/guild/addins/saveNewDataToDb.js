const db = require('../../../../db/db')

module.exports = (guild) => {
  guild.saveNewDataToDb = async () => {
    const previousDiff = guild.previousDiff || {}
    const currentDiff = guild.saveableData()

    const differences = {},
      differencesWithGeneralizedArrays = {}

    function traverse(obj, path = '') {
      if (Array.isArray(obj))
        return obj.forEach((o, index) => traverse(o, path + `.[${index}]`))
      if (typeof obj === 'object')
        return Object.keys(obj).forEach((o) =>
          traverse(obj[o], path + (path ? '.' : '') + o),
        )

      let propertyToCheck = previousDiff
      try {
        path.split('.').forEach((pEl) => {
          try {
            const int = parseInt(pEl.replace(/[\[\]]/g, ''))
            if (isNaN(int)) {
              propertyToCheck = propertyToCheck[pEl]
            } else {
              propertyToCheck = propertyToCheck[int]
            }
          } catch (e) {}
        })
        if (propertyToCheck === obj) return false
      } catch (e) {}
      differences[path.replace(/\.\[/g, '[')] = obj
    }

    traverse(currentDiff)

    Object.keys(differences).forEach((key) => {
      if (key.indexOf('[') === -1)
        return (differencesWithGeneralizedArrays[key] = differences[key])
      let arrayPath = key.substring(0, key.indexOf('['))

      let propertyToCheck = currentDiff
      arrayPath.split('.').forEach((pEl) => {
        propertyToCheck = propertyToCheck[pEl]
      })
      differencesWithGeneralizedArrays[arrayPath] = propertyToCheck
    })

    // console.log(differencesWithGeneralizedArrays)

    guild.previousDiff = currentDiff

    if (Object.keys(differencesWithGeneralizedArrays).length)
      await db.guild.update({
        guildId: guild.guildId,
        updates: differencesWithGeneralizedArrays,
      })
  }
}
