module.exports = (guild) => {
  guild.saveableMembers = () => {
    return guild.saveableData().ship.members
  }
}
