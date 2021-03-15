const { distance, getUnitVectorBetween } = require(`../common`)

module.exports = {
  log(type = `Core`, ...text) {
    console.log(`> ${type.padEnd(15, ` `)} |`, ...text)
  },
  allSkills: [
    {
      emoji: `👩‍💻`,
      name: `engineering`,
    },
    {
      emoji: `🚀`,
      name: `piloting`,
    },
    {
      emoji: `🔧`,
      name: `mechanics`,
    },
    {
      emoji: `⚔️`,
      name: `munitions`,
    },
    // {
    //   emoji: '📚',
    //   name: 'linguistics',
    // },
  ],
  getTrainingXp(minigameScore, skillLevel) {
    return 235 + 5 * skillLevel * minigameScore // yea some magic numbers sorry eslint
  },

  getGravityForceVector(thisBody, thatBody) {
    if (!thisBody || !thatBody || !thisBody.mass || !thatBody.mass)
      return [0, 0]

    const m1 = thisBody.mass
    const m2 = thatBody.mass

    const r = distance(...thisBody.location, ...thatBody.location)
    const G = GRAVITATIONAL_CONSTANT
    const gravityForce = Math.min(
      999999999,
      Math.max(-999999999, (-G * m1 * m2) / r ** 2),
    )
    const vectorToThisBody = getUnitVectorBetween(thisBody, thatBody)

    return vectorToThisBody.map((i) =>
      Math.min(0.5, Math.max(-0.5, i * gravityForce)),
    )
  },
}
