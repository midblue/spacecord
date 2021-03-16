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

  getGravityForceVectorOnThisBodyDueToThatBody(thisBody, thatBody) {
    if (!thisBody || !thatBody || !thisBody.mass || !thatBody.mass)
      return [0, 0]

    const m1 = thisBody.mass || 0
    const m2 = thatBody.mass || 0

    const r = distance(...thisBody.location, ...thatBody.location) * KM_PER_AU * M_PER_KM
    const G = GRAVITATIONAL_CONSTANT
    const gravityForce = Math.min(
      999999999,
      Math.max(-999999999, (-G * m1 * m2) / r ** 2),
    )
    const vectorToThisBody = getUnitVectorBetween(thisBody, thatBody)
    console.log(`vectorToThisBody`, vectorToThisBody)
    gravityForceVector = vectorToThisBody.map((i) => i * gravityForce)

    console.log(`gravityForceVector`, gravityForceVector)
    return gravityForceVector // kg * m / second == N
  },
}
