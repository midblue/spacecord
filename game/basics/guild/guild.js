const factionsData = require(`../factions`)
const cargoData = require(`../cargo`)
const equipmentData = require(`../equipment/equipment`)
const addins = require(`./addins`)
const createDefaultGuild = require(`./createDefaultGuild`)
const memberLiveify = require(`../crew/crew`).liveify

async function spawn({
  db,
  discordGuild,
  channelId,
  context,
}) {
  let guild
  guild = await db.guilds.get({ id: discordGuild.id })
  if (guild) {
    if (guild.banned) return false // todo implement
    liveify(guild)
    return guild
  }

  guild = createDefaultGuild({ discordGuild, channelId })
  liveify(guild, context)
  await db.guilds.add({
    id: discordGuild.id,
    data: guild.saveableData(),
  })
  return guild
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
  Object.keys(guild.ship.equipment || {}).forEach(
    (equipmentType) => {
      guild.ship.equipment[
        equipmentType
      ] = guild.ship.equipment[equipmentType]
        .map((part) => {
          const itemData =
            equipmentData[equipmentType][part.id]
          return {
            ...itemData,
            ...part,
          }
        })
        .filter((p) => p)
    },
  )

  // add base properties to cargo
  guild.ship.cargo = guild.ship.cargo.map((c) => ({
    ...cargoData[c.type],
    ...c,
  }))

  addins.forEach((addin) => addin(guild))

  guild.ship.members.forEach((m) => memberLiveify(m, guild))
}

module.exports = {
  spawn,
  liveify,
}
