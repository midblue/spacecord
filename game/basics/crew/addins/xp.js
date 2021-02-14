const levelNumbers = require('../levels')
const story = require('../../story/story')
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

  member.skillLevelDetails = (skill) => {
    if (!member.level) member.level = {}
    if (!member.xp) member.xp = {}

    let xp = member.xp?.[skill] || 0
    if (!xp) {
      xp =
        (member.level?.[skill] || 0) === 0
          ? 0
          : levelNumbers[member.level[skill] - 1] || 0
      member.xp[skill] = xp
    }

    const level = levelNumbers.findIndex((ln) => ln > xp)
    member.level[skill] = level

    const totalLevelXp = levelNumbers[level] || 0
    const levelSize = levelNumbers[level] - (levelNumbers[level - 1] || 0)
    const toNextLevel = totalLevelXp - xp
    const levelProgress = xp - (levelNumbers[level - 1] || 0)
    const percentToLevel = levelProgress / levelSize || 0
    const overallPercentToLevel = xp / levelNumbers[level] || 0

    const data = {
      xp,
      level,
      totalLevelXp,
      levelSize,
      toNextLevel,
      levelProgress,
      percentToLevel,
      overallPercentToLevel,
    }
    return data
  }

  member.totalLevel = () => {
    return Object.values(member.level).reduce((total, curr) => curr + total, 0)
  }
}
