const addins = require(`./addins`)

function spawn(guild) {
  const data = {
    joined: Date.now(),
    stamina: 1,
    level: [
      { skill: `piloting`, level: 2 },
      { skill: `engineering`, level: 2 },
      { skill: `mechanics`, level: 4 },
      // {skill: 'linguistics', level: 0,},
      { skill: `munitions`, level: 0 },
      { skill: `legacy`, level: 0 },
    ],
  }
  liveify(data, guild)
  return data
}

function liveify(member, guild) {
  member.guild = guild
  addins.forEach((addin) => addin(member))
}

module.exports = { spawn, liveify }
