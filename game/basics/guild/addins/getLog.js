const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.getLog = (count) => {
    const logEntriesWithGameTime = guild.ship.log
      .slice(0, count || 99999)
      .map((l) => ({
        timeUnitsAgo:
          (Date.now() - l.time) * process.env.REAL_TIME_TO_GAME_TIME_MULTIPLIER,
        text: l.text,
      }))
    let outputString = logEntriesWithGameTime
      .map((l) => {
        const isLong = l.timeUnitsAgo >= process.env.TIME_UNIT_SHORTS_PER_LONG
        const timeCount = Math.round(
          l.timeUnitsAgo / (isLong ? process.env.TIME_UNIT_SHORTS_PER_LONG : 1),
        )
        let unit =
          Math.round(timeCount) === 1
            ? process.env.TIME_UNIT_SINGULAR
            : process.env.TIME_UNIT
        if (isLong)
          unit =
            Math.round(timeCount) === 1
              ? process.env.TIME_UNIT_LONG_SINGULAR
              : process.env.TIME_UNIT_LONG
        return `\`${timeCount} ${unit} ago:\` ${l.text}`
      })
      .join('\n')
    if (!outputString) outputString = story.log.empty()
    return { ok: true, message: outputString }
  }
}
