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

    m1 = thisBody.mass
    m2 = thatBody.mass

    r = distance(...thisBody.location, ...thatBody.location)
    let G = GRAVITATIONAL_CONSTANT
    gravityForce = Math.min(
      999999999,
      Math.max(-999999999, (-G * m1 * m2) / r ** 2),
    )
    vectorToThisBody = getUnitVectorBetween(thisBody, thatBody)

    return vectorToThisBody.map((i) =>
      Math.min(0.5, Math.max(-0.5, i * gravityForce)),
    )
  },
}
