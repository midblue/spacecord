const addins = require(`./addins`)

function spawn(guild) {
  const data = {
    joined: Date.now(),
    stamina: 1,
    level: [
      { skill: `piloting`, level: 1, },
      { skill: `engineering`, level: 1 },
      { skill: `mechanics`, level: 1 },
      // {skill: 'linguistics', level: 1,},
      { skill: `munitions`, level: 1 },
      { skill: `legacy`, level: 1 },
    ],
    xp: [
      { skill: `piloting`, xp: 0, },
      { skill: `engineering`, xp: 0 },
      { skill: `mechanics`, xp: 0 },
      // {skill: 'linguistics', xp:0,},
      { skill: `munitions`, xp: 0 },
      { skill: `legacy`, xp: 0 },
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
