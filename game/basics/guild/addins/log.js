const story = require('../../story/story')
const maxLogLength = 50

module.exports = (guild) => {
  guild.ship.logEntry = (logEntry) => {
    if (!guild.ship.log) guild.ship.log = []
    guild.ship.log.unshift({ time: Date.now(), text: logEntry })
    if (guild.ship.log.length > maxLogLength)
      guild.ship.log = guild.ship.log.slice(0, maxLogLength)
  }

  guild.ship.getLog = (count) => {
    const logEntriesWithGameTime = guild.ship.log
      .slice(0, count || 99999)
      .map((l) => {
        console.log(
          Date.now() - l.time,
          (Date.now() - l.time) * process.env.REAL_TIME_TO_GAME_TIME_MULTIPLIER,
          1200000 * process.env.REAL_TIME_TO_GAME_TIME_MULTIPLIER,
        )
        return {
          timeUnitsAgo:
            (Date.now() - l.time) *
            process.env.REAL_TIME_TO_GAME_TIME_MULTIPLIER,
          text: l.text,
        }
      })
    let outputString = logEntriesWithGameTime
      .map((l) => {
        const isLong = l.timeUnitsAgo >= process.env.TIME_UNIT_SHORTS_PER_LONG
        const timeCount = Math.round(
          l.timeUnitsAgo / (isLong ? process.env.TIME_UNIT_SHORTS_PER_LONG : 1),
        )
        let unit =
          Math.round(timeCount) === 1
            ? process.env.TIME_UNIT
            : process.env.TIME_UNITS
        if (isLong)
          unit =
            Math.round(timeCount) === 1
              ? process.env.TIME_UNIT_LONG
              : process.env.TIME_UNIT_LONGS
        return `\`${timeCount} ${unit} ago:\` ${l.text}`
      })
      .join('\n')
    if (!outputString) outputString = story.log.empty()
    return { ok: true, message: outputString }
  }
}
