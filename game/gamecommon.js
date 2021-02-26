module.exports = {
  log (type = `Core`, ...text) {
    console.log(`> ${type.padEnd(15, ` `)} |`, ...text)
  },
  allSkills: [
    {
      emoji: `👩‍💻`,
      name: `engineering`
    },
    {
      emoji: `🚀`,
      name: `piloting`
    },
    {
      emoji: `🔧`,
      name: `mechanics`
    },
    {
      emoji: `⚔️`,
      name: `munitions`
    }
    // {
    //   emoji: '📚',
    //   name: 'linguistics',
    // },
  ],
  getTrainingXp (minigameScore, skillLevel) {
    return 235 + (5 * skillLevel) * minigameScore // yea some magic numbers sorry eslint
  }
}
