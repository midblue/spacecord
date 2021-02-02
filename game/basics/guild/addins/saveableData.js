const spawn = require('../spawn')
const shipsData = require('../../ships')
const equipmentData = require('../../equipment')
const addins = require('./index')

module.exports = (guild) => {
  guild.saveableData = () => {
    const guildToSave = {
      ...guild,
      ship: {
        ...guild.ship,
        members: [...guild.ship.members.map((m) => ({ ...m }))],
      },
    }

    // remove base properties from ship
    Object.keys(shipsData[guild.ship.model]).forEach(
      (key) => delete guildToSave.ship[key],
    )

    // remove base properties from items onboard
    Object.keys(guild.ship.equipment || {}).forEach((equipmentType) => {
      guildToSave.ship.equipment[equipmentType].forEach((part) => {
        const itemData = equipmentData[equipmentType][part.id]
        for (let prop in itemData) delete part[prop]
      })
    })

    Object.keys(guildToSave).forEach((key) => {
      if (typeof guildToSave[key] === 'function') delete guildToSave[key]
    })

    Object.keys(guildToSave.ship).forEach((key) => {
      if (typeof guildToSave.ship[key] === 'function')
        delete guildToSave.ship[key]
    })

    for (let member of guildToSave.ship.members) {
      Object.keys(member).forEach((key) => {
        if (typeof member[key] === 'function') delete member[key]
      })
    }

    const dummyGuildObject = spawn({ name: 'asdf', id: 1234 }, 'asdf')
    for (let prop of guildToSave)
      if (!dummyGuildObject[prop]) delete guildToSave[prop]
    for (let prop of guildToSave.ship)
      if (!dummyGuildObject.ship[prop]) delete guildToSave.ship[prop]

    return guildToSave
  }
}
