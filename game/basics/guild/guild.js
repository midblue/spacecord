const shipsData = require('../ships')
const equipmentData = require('../equipment/equipment')
const addins = require('./addins/index')
const makeNew = require('./spawn')
const db = require('../../../db/db')
const memberLiveify = require('../crew/crew').liveify

async function spawn({ discordGuild, channelId, context }) {
  let guild
  guild = await db.guild.get({ guildId: discordGuild.id })
  if (guild) {
    liveify(guild)
    return guild
  }

  guild = makeNew({ discordGuild, channelId })
  liveify(guild, context)
  db.guild.add({ guildId: discordGuild.id, data: guild.saveableData() })
  return guild
}

function liveify(guild, context) {
  guild.context = context

  guild.ship.server = {
    id: guild.guildId,
    name: guild.guildName,
  }

  // add base properties to ship
  guild.ship = {
    ...shipsData[guild.ship.model],
    ...guild.ship, // this order allows us to have "unique" items/ships
  }

  // add base properties to items onboard
  Object.keys(guild.ship.equipment || {}).forEach((equipmentType) => {
    guild.ship.equipment[equipmentType] = guild.ship.equipment[equipmentType]
      .map((part) => {
        const itemData = equipmentData[equipmentType][part.id]
        return {
          ...itemData,
          ...part,
        }
      })
      .filter((p) => p)
  })

  addins.forEach((addin) => addin(guild))

  guild.ship.members.forEach((m) => memberLiveify(m, guild))
}

module.exports = {
  spawn,
  liveify,
}
