module.exports = (member) => {
  member.saveToDb = () => {
    member.guild.context.db.crewMember.update({
      id: member.crewMemberId,
      updates: { ...member },
    })
  }

  member.stepUpdate = () => {
    member.gainStamina()
  }
}
