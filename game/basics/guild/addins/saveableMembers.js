module.exports = (guild) => {
  guild.saveableMembers = () => {
    return guild.ship.members.map((m) => m.saveableData())
  }
}
