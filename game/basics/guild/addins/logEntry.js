const maxLogLength = 50
module.exports = (guild) => {
  guild.ship.logEntry = (logEntry) => {
    if (!guild.ship.log) guild.ship.log = []
    guild.ship.log.unshift({ time: Date.now(), text: logEntry })
    if (guild.ship.log.length > maxLogLength)
      guild.ship.log = guild.ship.log.slice(0, maxLogLength)
  }
}
