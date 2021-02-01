const story = require('../../story/story')
const levelNumbers = require('../../crewLevels')

module.exports = (guild) => {
  guild.ship.addXp = (id, skill, xpAmount) => {
    const member = guild.ship.members.find((m) => m.id === id)
    if (!member)
      return {
        ok: false,
        message: story.xp.add.missingUser(),
      }
    if (!member.skill) member.skill = {}
    if (!member.xp) member.xp = {}
    const startLevel = member.skill[skill] || 0
    const startXp = member.xp[skill] || 0
    const newXp = (member.xp[skill] || 0) + xpAmount
    member.xp[skill] = newXp
    const prevLevel = levelNumbers.findIndex((ln) => ln >= startXp)
    const newLevel = levelNumbers.findIndex((ln) => ln >= newXp)
    member.skill[skill] = newLevel

    const didLevelUp = newLevel !== prevLevel
    const levelSize = levelNumbers[newLevel] - levelNumbers[newLevel - 1]
    const levelProgress = newXp - levelNumbers[newLevel - 1]
    const toNextLevel = levelNumbers[newLevel] - newXp
    const percentToLevel = levelProgress / levelSize
    console.log(
      prevLevel,
      newLevel,
      startXp,
      newXp,
      didLevelUp,
      levelSize,
      levelNumbers[newLevel],
      levelNumbers[newLevel + 1],
      toNextLevel,
      levelProgress,
      percentToLevel,
    )
    return {
      ok: true,
      message: story.xp.add.success(
        id,
        skill,
        xpAmount,
        newLevel,
        didLevelUp,
        levelSize,
        levelProgress,
        percentToLevel,
      ),
    }
  }
}
