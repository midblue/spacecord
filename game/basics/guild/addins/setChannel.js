module.exports = (guild) => {
  guild.setChannel = async (id) => {
    guild.channel = id
    await guild.saveNewDataToDb()
    return {
      ok: true,
      message: 'Guild channel updated.',
    }
  }
}
