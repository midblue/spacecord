const { ship } = require('../../story/story')
const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.eat = () => {
    const ship = guild.ship
    let ok = true,
      message
    const food = ship.cargo.find((c) => c.type === 'food')
    if (!food.amount)
      return {
        ok: false,
      }

    const amountConsumed = 0.01 * ship.members.length

    food.amount -= amountConsumed
    if (food.amount <= 0) {
      food.amount = 0
      ship.status.starving = true
      message = story.food.insufficient()
      ok = false
    } else if (food.amount < amountConsumed * 10 && Math.random() > 0.9) {
      const ticksLeftBeforeStarvation = Math.ceil(food.amount / amountConsumed)
      message = story.food.low(food.amount, ticksLeftBeforeStarvation)
    }

    return {
      ok,
      amountConsumed,
      message,
    }
  }
}
