const story = require(`../../story/story`)
const powerRequirements = require(`../powerRequirements`)

module.exports = (guild) => {
  guild.ship.usePower = (amount, notify = true) => {
    if (typeof amount === `string`) amount = powerRequirements[amount]
    let message

    const batteriesBroken = guild.ship.equipment
      .find((e) => e.equipmentType === `battery`)
      .list.reduce(
        (allAreBroken, battery) => allAreBroken && battery.repair <= 0,
        true,
      )
    if (batteriesBroken)
      return { ok: false, message: story.power.batteriesBroken() }

    if (amount <= guild.ship.power) {
      guild.ship.power -= amount

      guild.ship.equipment
        .find((e) => e.equipmentType === `battery`)
        .list.forEach((battery) => {
          battery.useDurability()
        })

      return { ok: true }
    }
    if (notify) {
      message = story.power.insufficient(guild, amount)
      // guild.ship.logEntry(story.power.insufficient(guild, amount))
    }
    return { ok: false, message }
  }

  guild.ship.maxPower = () => {
    return guild.ship.equipment
      .find((e) => e.equipmentType === `battery`)
      .list.reduce(
        (total, battery) => battery.capacity * battery.repair + total,
        0,
      )
  }

  guild.ship.addPower = (powerToAdd) => {
    const currentPower = guild.ship.power

    guild.ship.equipment
      .find((e) => e.equipmentType === `battery`)
      .list.forEach((battery) => {
        battery.useDurability()
      })

    const maxPower = guild.ship.maxPower()
    // todo eventually have more efficient power generating upgrades
    let toAdd = powerToAdd
    if (currentPower + toAdd > maxPower) toAdd = maxPower - currentPower
    if (toAdd < 0) toAdd = 0 // don't kill an overcharge
    guild.ship.power = currentPower + toAdd
    if (guild.ship.power < 0) guild.ship.power = 0

    return {
      ok: true,
      generatedPower: toAdd,
      currentPower: guild.ship.power,
      message: story.power.add.treadmill(
        powerToAdd,
        toAdd,
        guild.ship.power,
        maxPower,
      ),
    }
  }
}
