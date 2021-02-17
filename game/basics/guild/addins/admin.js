const story = require(`../../story/story`)
module.exports = (guild) => {
  guild.ship.setCaptain = async (id) => {
    const foundMember = guild.ship.members.find((m) => m.id === id)
    if (isNaN(id) || !foundMember) {
      return {
        ok: false,
        message: `No crew member found by the id ${id}. Right click the user and select 'Copy ID' to get their ID.`
      }
    }

    guild.ship.captain = id
    await guild.saveNewDataToDb()
    return {
      ok: true,
      message: story.ship.captain.change(foundMember)
    }
  }

  guild.setChannel = async (id) => {
    guild.channel = id
    await guild.saveNewDataToDb()
    return {
      ok: true,
      message: `Guild channel updated.`
    }
  }

  guild.ship.setName = async (newName) => {
    guild.ship.name = newName
    await guild.saveNewDataToDb()
    return {
      ok: true,
      message: story.ship.name.change(newName)
    }
  }
}
