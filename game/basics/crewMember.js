function spawn(user) {
  const id = user.id || user.user.id
  const data = {
    id,
    skills: {
      piloting: 2,
      engineering: 2,
    },
  }
  liveify(data)
  return data
}

function liveify(baseMemberObject) {}

module.exports = spawn
