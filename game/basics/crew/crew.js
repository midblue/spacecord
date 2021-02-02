const addins = require('./addins/index')

function spawn(user) {
  const id = user.id || user.user.id
  const data = {
    id,
    level: {
      piloting: 2,
      engineering: 2,
      mechanics: 4,
    },
  }
  liveify(data)
  return data
}

function liveify(member) {
  addins.forEach((addin) => addin(member))
}

module.exports = spawn
