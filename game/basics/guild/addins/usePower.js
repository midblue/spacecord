const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.usePower = (amount, notify = true) => {
    let message
    // todo battery durability here and in addPower
    if (amount <= guild.ship.power) {
      guild.ship.power -= amount
      return { ok: true, message }
    }
    if (notify) message = story.power.insufficient(guild, amount)
    return { ok: false, message }
  }
}
