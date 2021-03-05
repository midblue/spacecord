const addins = require(`./addins`)

function spawn(user, guild) {
  const data = {
    joined: Date.now(),
    stamina: 1,
    level: {
      piloting: 2,
      engineering: 2,
      mechanics: 4,
      // linguistics: 0,
      munitions: 0,
      legacy: 0,
    },
  }
  liveify(data, guild)
  return data
}

function liveify(member, guild) {
  member.guild = guild
  addins.forEach((addin) => addin(member))
}

module.exports = { spawn, liveify }
