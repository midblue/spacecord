const story = require('../../story/story')
const levelNumbers = require('../levels')
const db = require('../../../../db/db')

module.exports = (member) => {
  member.addXp = (skill, xpAmount) => {
    const baseline = member.skillLevelDetails(skill) // this resets everything for us, in case the user spawned with levels but no xp

    const startLevel = baseline.level
    const startXp = baseline.xp
    const newXp = startXp + xpAmount
    member.xp[skill] = newXp

    const result = member.skillLevelDetails(skill)

    db.guild.updateCrewMembers({
      guildId: member.guild.guildId,
      members: member.guild.saveableMembers(),
    })

    return {
      ok: true,
      message: story.xp.add.success(
        member.id,
        skill,
        xpAmount,
        result.level,
        startLevel !== result.level,
        result.levelSize,
        result.levelProgress,
        result.percentToLevel,
      ),
    }
  }
}
