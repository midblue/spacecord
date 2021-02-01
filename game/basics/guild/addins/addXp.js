const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.addXp = (id, skill, xpAmount) => {
    const member = guild.ship.members.find((m) => m.id === id)
    if (!member)
      return {
        ok: false,
        message: story.xp.add.missingUser(),
      }
    if (!member.xp) member.xp = {}
    member.xp[skill] = (member.xp[skill] || 0) + xpAmount
    const level = (member.level || {})[skill] || 0
    const didLevelUp = true
    const levelSize = 100000
    const toNextLevel = 50000
    return {
      ok: true,
      message: story.xp.add.success(
        id,
        skill,
        xpAmount,
        level,
        didLevelUp,
        levelSize,
        toNextLevel,
      ),
    }
  }
}
