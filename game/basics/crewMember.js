function spawn(user) {
  const id = user.id || user.user.id
  const data = {
    id,
  }
  liveify(data)
  return data
}

function liveify(baseMemberObject) {
  return
}

module.exports = spawn
