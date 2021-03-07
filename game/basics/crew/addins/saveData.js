module.exports = (member) => {
  member.saveNewDataToDb = () => {
    member.guild.context.db.crewMember.update({
      id: member.crewMemberId,
      updates: { ...member },
    })
  }

  member.stepUpdate = () => {
    member.gainStamina()
  }
}
