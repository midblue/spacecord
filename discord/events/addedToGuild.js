const { log } = require(`../botcommon`)
const manager = require(`../../game/manager`)

module.exports = async (guild) => {
  const readd = await manager.activateGuild(guild.id)
  log(
    { guild },
    readd ? `Re-added to guild` : `Added to guild`,
    guild.name,
    guild.id
  )
}
