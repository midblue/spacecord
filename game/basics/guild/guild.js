const shipsData = require('../ships')
const equipmentData = require('../equipment')
const addins = require('./addins/index')
const spawn = require('./spawn')

async function make({ discordGuild, channelId }) {
  let guild
  // todo when we have database
  //  const savedServer = await db.getServer(discordGuild.id)
  if (!guild) guild = spawn({ discordGuild, channelId })
  liveify(guild)
  return guild
}

function liveify(guild) {
  guild.ship.server = {
    id: guild.guildId,
    name: guild.guildName,
  }

  // add base properties to ship
  guild.ship = {
    ...guild.ship,
    ...shipsData[guild.ship.model],
  }

  // add base properties to items onboard
  Object.keys(guild.ship.equipment || {}).forEach((equipmentType) => {
    guild.ship.equipment[equipmentType] = guild.ship.equipment[equipmentType]
      .map((part) => {
        const itemData = equipmentData[part.id]
        return {
          ...part,
          ...itemData,
        }
      })
      .filter((p) => p)
  })

  addins.forEach((addin) => addin(guild))
}

module.exports = make
