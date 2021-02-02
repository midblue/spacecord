const levelNumbers = require('../levels')

module.exports = (member) => {
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
}
