const createDefaultGuild = require('../createDefaultGuild')
const shipsData = require('../../ships')
const factionsData = require('../../factions')
const equipmentData = require('../../equipment/equipment')
const { ship } = require('../../story/story')

module.exports = (guild) => {
  guild.saveableData = () => {
    const guildToSave = JSON.parse(
      JSON.stringify({
        ...guild,
        context: undefined,
        ship: {
          ...guild.ship,
          members: (guild.ship.members || []).map((m) => m.saveableData()),
          faction: { ...guild.ship.faction },
        },
      }),
    )

    delete guildToSave.context
    delete guildToSave.previousDiff
    delete guildToSave.ship.guild

    // remove base properties from ship
    Object.keys(shipsData[guild.ship.model]).forEach(
      (key) => delete guildToSave.ship[key],
    )

    // remove base properties from faction
    Object.keys(factionsData[guild.ship.faction.color]).forEach(
      (key) => delete guildToSave.ship.faction[key],
    )

    // remove base properties from items onboard
    Object.keys(guild.ship.equipment || {}).forEach((equipmentType) => {
      guildToSave.ship.equipment[equipmentType].forEach((part) => {
        const itemData = equipmentData[equipmentType][part.id]
        for (let prop in itemData) delete part[prop]
      })
    })

    const dummyGuildObject = createDefaultGuild({
      discordGuild: { name: 'asdf', id: 1234 },
      channelId: 'asdf',
    })
    for (let key of Object.keys(guildToSave))
      if (!dummyGuildObject[key] && dummyGuildObject[key] !== 0)
        delete guildToSave[key]
    for (let key of Object.keys(guildToSave.ship))
      if (!dummyGuildObject.ship[key] && dummyGuildObject.ship[key] !== 0)
        delete guildToSave.ship[key]

    return guildToSave
  }
}
