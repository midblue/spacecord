const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.attackShip = (enemyShip, weapon) => {
    const enemyIsInAttackRange = isInAttackRange(guild.ship, enemyShip)
    const enemyTotalPilotingLevel = enemyShip.members.reduce(
      (total, m) => total + m.level?.piloting || 0,
      0,
    )
    const ourTotalMunitionsLevel = guild.ship.members.reduce(
      (total, m) => total + m.level?.munitions || 0,
      0,
    )
    const advantage = ourTotalMunitionsLevel - enemyTotalPilotingLevel
    const adjustedAccuracy = weapon.accuracy * weapon.repair
    console.log(
      enemyIsInAttackRange,
      enemyTotalPilotingLevel,
      ourTotalMunitionsLevel,
      advantage,
      adjustedAccuracy,
    )
  }
}

function isInAttackRange(us, them) {
  return true
}
