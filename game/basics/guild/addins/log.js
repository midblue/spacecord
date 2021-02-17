const story = require('../../story/story')
const maxLogLength = 50

module.exports = (guild) => {
  guild.ship.logEntry = (logEntry) => {
    if (!guild.ship.log) guild.ship.log = []
    guild.ship.log.unshift({ time: Date.now(), text: logEntry })
    if (guild.ship.log.length > maxLogLength) { guild.ship.log = guild.ship.log.slice(0, maxLogLength) }
  }

  guild.ship.getLog = (count) => {
    const logEntriesWithGameTime = guild.ship.log
      .slice(0, count || 99999)
      .map((l) => {
        return {
          timeUnitsAgo:
            (Date.now() - l.time) * REAL_TIME_TO_GAME_TIME_MULTIPLIER,
          text: l.text
        }
      })
    let outputString = logEntriesWithGameTime
      .map((l) => {
        const isLong = l.timeUnitsAgo >= TIME_UNIT_SHORTS_PER_LONG
        const timeCount = Math.round(
          l.timeUnitsAgo / (isLong ? TIME_UNIT_SHORTS_PER_LONG : 1)
        )
        let unit = Math.round(timeCount) === 1 ? TIME_UNIT : TIME_UNITS
        if (isLong) { unit = Math.round(timeCount) === 1 ? TIME_UNIT_LONG : TIME_UNIT_LONGS }
        return `\`${timeCount} ${unit} ago:\` ${l.text}`
      })
      .join('\n')
    if (!outputString) outputString = story.log.empty()
    return { ok: true, message: outputString }
  }
}
