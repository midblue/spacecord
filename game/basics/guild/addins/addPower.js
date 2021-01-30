const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.addPower = (generateResult) => {
    const currentPower = guild.ship.power
    const maxPower = guild.ship.maxPower()
    // todo eventually have more efficient power generating upgrades
    let toAdd = generateResult
    if (currentPower + toAdd > maxPower) toAdd = maxPower - currentPower
    if (toAdd < 0) toAdd = 0 // don't kill an overcharge
    guild.ship.power = currentPower + toAdd
    return {
      ok: true,
      generatedPower: toAdd,
      currentPower: guild.ship.power,
      message: story.power.add.treadmill(
        generateResult,
        toAdd,
        guild.ship.power,
        maxPower,
      ),
    }
  }
}
