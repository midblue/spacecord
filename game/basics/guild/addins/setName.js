const story = require('../../story/story')
module.exports = (guild) => {
  guild.ship.setName = async (newName) => {
    guild.ship.name = newName
    await guild.saveNewDataToDb()
    return {
      ok: true,
      message: story.ship.name.change(newName),
    }
  }
}
