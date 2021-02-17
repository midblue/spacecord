const db = require(`../../../../db/db`)
const createDefaultGuild = require(`../createDefaultGuild`)
const factionsData = require(`../../factions`)
const cargoData = require(`../../cargo`)
const equipmentData = require(`../../equipment/equipment`)

module.exports = (guild) => {
  guild.saveableMembers = () => {
    return guild.ship.members.map((m) => m.saveableData())
  }

  guild.saveableData = () => {
    const guildToSave = JSON.parse(
      JSON.stringify({
        ...guild,
        context: undefined,
        ship: {
          ...guild.ship,
          guild: undefined,
          members: (guild.ship.members || []).map((m) => m.saveableData()),
          faction: { ...guild.ship.faction }
        }
      })
    )

    delete guildToSave.context
    delete guildToSave.previousDiff
    delete guildToSave.ship.guild

    // remove base properties from faction
    if (guild.faction?.color) {
      Object.keys(factionsData[guild.faction.color]).forEach((key) => {
        if (key !== `color`) delete guildToSave.faction[key]
      })
    }

    // remove base properties from items onboard
    Object.keys(guild.ship.equipment || {}).forEach((equipmentType) => {
      guildToSave.ship.equipment[equipmentType].forEach((part) => {
        const itemData = equipmentData[equipmentType][part.id]
        for (const prop in itemData) if (prop !== `id`) delete part[prop]
      })
    })

    guildToSave.ship.cargo = guild.ship.cargo
      .map((c) => {
        const baseCargo = { ...c }
        for (const prop in cargoData[c.type]) delete baseCargo[prop]
        return baseCargo
      })
      .filter((c) => c.amount > 0.000001)

    // remove base properties from cargo
    guild.ship.cargo.map((c) => ({ ...cargoData[c.type], ...c }))

    const dummyGuildObject = createDefaultGuild({
      discordGuild: { name: `asdf`, id: 1234 },
      channelId: `asdf`
    })
    for (const key of Object.keys(guildToSave)) { if (dummyGuildObject[key] === undefined) delete guildToSave[key] }
    for (const key of Object.keys(guildToSave.ship)) { if (dummyGuildObject.ship[key] === undefined) delete guildToSave.ship[key] }

    return guildToSave
  }

  guild.saveNewDataToDb = async () => {
    const previousDiff = guild.previousDiff || {}
    const currentDiff = guild.saveableData()

    const differences = {}
    const differencesWithGeneralizedArrays = {}

    function traverse (obj, path = ``) {
      if (Array.isArray(obj)) { return obj.forEach((o, index) => traverse(o, path + `.[${index}]`)) }
      if (typeof obj === `object` && obj) {
        return Object.keys(obj).forEach((o) =>
          traverse(obj[o], path + (path ? `.` : ``) + o)
        )
      }

      let propertyToCheck = previousDiff
      try {
        path.split(`.`).forEach((pEl) => {
          try {
            const int = parseInt(pEl.replace(/[\[\]]/g, ``))
            if (isNaN(int)) {
              propertyToCheck = propertyToCheck[pEl]
            } else {
              propertyToCheck = propertyToCheck[int]
            }
          } catch (e) {}
        })
        if (propertyToCheck === obj) return false
      } catch (e) {}
      differences[path.replace(/\.\[/g, `[`)] = obj
    }

    traverse(currentDiff)

    Object.keys(differences).forEach((key) => {
      if (key.indexOf(`[`) === -1) { return (differencesWithGeneralizedArrays[key] = differences[key]) }
      const arrayPath = key.substring(0, key.indexOf(`[`))

      let propertyToCheck = currentDiff
      arrayPath.split(`.`).forEach((pEl) => {
        propertyToCheck = propertyToCheck[pEl]
      })
      differencesWithGeneralizedArrays[arrayPath] = propertyToCheck
    })

    // console.log(differencesWithGeneralizedArrays)

    guild.previousDiff = currentDiff

    if (Object.keys(differencesWithGeneralizedArrays).length) {
      await db.guild.update({
        guildId: guild.guildId,
        updates: differencesWithGeneralizedArrays
      })
    }
  }
}
