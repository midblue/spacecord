const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.usePower = (amount, notify = true) => {
    if (amount <= guild.ship.power) {
      guild.ship.power -= amount
      return true
    }
    if (notify) guild.pushToGuild(story.power.insufficient(guild, amount))
    return false
  }
}
