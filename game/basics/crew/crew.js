const addins = require(`./addins/index`)

function spawn (user, guild) {
  const id = user.id || user.user.id
  const data = {
    id,
    joined: Date.now(),
    stamina: 1,
    level: {
      piloting: 2,
      engineering: 2,
      mechanics: 4,
      // linguistics: 0,
      munitions: 0
    }
  }
  liveify(data, guild)
  return data
}

function liveify (member, guild) {
  member.guild = guild
  addins.forEach((addin) => addin(member))
}

module.exports = { spawn, liveify }
