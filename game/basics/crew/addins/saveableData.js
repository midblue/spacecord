module.exports = (member) => {
  member.saveableData = () => {
    const memberToSave = JSON.parse(JSON.stringify({ ...member, guild: false }))
    delete memberToSave.guild
    return memberToSave
  }
}
