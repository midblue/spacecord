const story = require('../../story/story')

module.exports = (guild) => {
  guild.stepUpdate = async (amount, notify = true) => {
    if (!guild.ship.status.docked) {
      const moveRes = guild.ship.move()
      if (moveRes.message) guild.pushToGuild(moveRes.message)
    }

    // const eatRes = guild.ship.eat()
    // if (!eatRes.ok && eatRes.message) guild.pushToGuild(eatRes.message)

    guild.ship.members.forEach((m) => m.stepUpdate())

    await guild.saveNewDataToDb()
  }

  guild.ship.eat = () => {
    const ship = guild.ship
    let ok = true
    let message
    const food = ship.cargo.find((c) => c.type === 'food')
    if (!food || !food.amount) {
      return {
        ok: false
      }
    }

    const amountConsumed = 0.001 * ship.members.length

    food.amount -= amountConsumed
    const ticksLeftBeforeStarvation = Math.ceil(food.amount / amountConsumed)

    if (food.amount <= 0) {
      food.amount = 0
      ship.status.starving = true
      message = story.food.insufficient()
      ok = false
    } else if (ticksLeftBeforeStarvation < 20 && Math.random() > 0.9) {
      message = story.food.low(food.amount, ticksLeftBeforeStarvation)
    }

    return {
      ok,
      amountConsumed,
      message
    }
  }
}
