const levelNumbers = require(`../levels`)
const story = require(`../../story/story`)
const { log, allSkills } = require(`../../../gamecommon`)

module.exports = (member) => {
  member.getTrainableSkills = async () => {
    const trainableSkills = [
      ...allSkills.map((s) => {
        const memberSkill =
          member.level.find((l) => l.skill === s.name)?.level || 0
        const staminaRequired = member.staminaRequiredFor(s.name)
        return { ...s, memberSkill, staminaRequired }
      }),
    ]
    return trainableSkills
  }

  member.staminaRequiredFor = (skill) => {
    return Math.ceil(
      Math.sqrt(member.level.find((l) => l.skill === skill)?.level || 1),
    )
  }

  member.train = (skill, successRatio, difficultyMod = 1) => {
    const xpToGain = 500 * successRatio * difficultyMod
    return member.addXp(skill, xpToGain)
  }

  member.addXp = (skill, xpAmount, silent) => {
    const baseline = member.skillLevelDetails(skill) // this resets everything for us, in case the user spawned with levels but no xp

    const startLevel = baseline.level
    const startXp = baseline.xp
    const newXp = startXp + xpAmount

    const foundXpEntry = member.xp.find((x) => x.skill === skill)
    if (!foundXpEntry) member.xp.push({ skill, xp: newXp })
    else foundXpEntry.xp = newXp

    const result = member.skillLevelDetails(skill)

    member.saveNewDataToDb()

    return {
      ok: true,
      message: silent
        ? ``
        : story.xp.add.success(
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
    if (!member.level) member.level = []
    if (!member.xp) member.xp = []

    let xp = member.xp.find((x) => x.skill === skill)?.xp || 0
    if (!xp) {
      xp =
        (member.level.find((l) => l.skill === skill)?.level || 0) === 0
          ? 0
          : levelNumbers[
              member.level.find((l) => l.skill === skill)?.level - 1
            ] || 0
      const foundXpEntry = member.xp.find((x) => x.skill === skill)
      if (!foundXpEntry) member.xp.push({ skill, xp })
      else foundXpEntry.xp = xp
    }

    const level = levelNumbers.findIndex((ln) => ln > xp)
    const foundLevelEntry = member.level.find((l) => l.skill === skill)
    if (foundLevelEntry) foundLevelEntry.level = level
    else member.level.push({ skill, level })

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
    return member.level.reduce((total, { level }) => level + total, 0)
  }
}
