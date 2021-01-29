const guild = require('./basics/guild')

module.exports = {
  spawn(discordGuild) {
    return guild.spawn(discordGuild)
  },
}
