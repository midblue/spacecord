const story = require('../../story/story')

module.exports = (guild) => {
  guild.stepUpdate = async (amount, notify = true) => {
    const moveRes = guild.ship.move()
    if (!moveRes.ok && moveRes.message) guild.pushToGuild(moveRes.message)

    const eatRes = guild.ship.eat()
    if (!eatRes.ok && eatRes.message) guild.pushToGuild(eatRes.message)

    guild.ship.members.forEach((m) => m.stepUpdate())

    await guild.saveNewDataToDb()
  }
}
