const factionsData = require(`../factions`)
const cargoData = require(`../cargo`)
const equipmentData = require(`../equipment/equipment`)
const addins = require(`./addins`)
const createDefaultGuild = require(`./createDefaultGuild`)
const memberLiveify = require(`../crew/crew`).liveify

async function spawn({ db, discordGuild, channelId, context }) {
  let guild
  guild = await db.guilds.get({ id: discordGuild.id })
  if (guild) {
    if (guild.banned) return false // todo implement
    liveify(guild, context)
    return guild
  }

  guild = createDefaultGuild({ discordGuild, channelId })
  const addedGuild = await db.guilds.add({
    id: discordGuild.id,
    data: guild,
  })
  liveify(addedGuild, context)
  return addedGuild
}

function liveify(guild, context) {
  guild.context = context

  guild.ship.server = {
    id: guild.id,
    name: guild.name,
  }

  guild.ship.guild = guild

  // add base properties to faction
  if (guild.faction?.color) {
    guild.faction = {
      ...factionsData[guild.faction.color],
      ...guild.faction,
    }
  }

  // add base properties to items onboard
  guild.ship.equipment.forEach((e) => {
    e.list = e.list
      .map((part) => {
        const itemData = equipmentData[e.equipmentType][part.id]
        return {
          ...itemData,
          ...part,
        }
      })
      .filter((p) => p)
  })

  // add base properties to cargo
  for (let index in guild.ship.cargo)
    for (let key of Object.keys(cargoData[guild.ship.cargo[index].cargoType]))
      guild.ship.cargo[index][key] =
        cargoData[guild.ship.cargo[index].cargoType][key]

  addins.forEach((addin) => addin(guild))

  if (!guild.ship.members) guild.ship.members = []
  guild.ship.members.forEach((m) => memberLiveify(m, guild))
}

module.exports = {
  spawn,
  liveify,
}
