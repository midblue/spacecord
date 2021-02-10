const { numberToEmoji, percentToTextBars } = require('../../../../common')

module.exports = {
  // emoji: '📡',
  emoji: '😜',
  displayName: 'Emoji Scanner v1',
  baseHp: 15,
  powerUse: 2,
  range: 5,
  needsRepairAt: 0.8,
  breakdownSeverity: 0.05,
  durabilityLostOnUse: 0.01,
  repairDifficulty: 1,
  repairRequirements: { mechanics: 4 },
  requirements: { engineering: 2 },
  use({ scanResult, x, y }) {
    const previousRepair = this.repair
    this.repair = (this.repair ?? 1) - (this.durabilityLostOnUse ?? 0.01)
    if (this.repair < 0) this.repair = 0

    const repair = this.repair,
      range = this.range

    if (repair <= 0) {
      if (previousRepair !== repair)
        guild.ship.logEntry(story.repair.breakdown(this.displayName))
      return {
        map: `
*******************
**               **
**  BROKEN_DOWN  **
** PLEASE_REPAIR **
**       🤕      **
**               **
*******************`,
        key: [],
        model: this.displayName,
        repair,
      }
    }

    const emptySpace = '⬛'

    const deadCharacters = [
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      '❌',
      emptySpace,
      emptySpace,
      emptySpace,
      emptySpace,
      emptySpace,
      emptySpace,
      '🛸',
      '🌖',
    ]

    const getChar = (base) =>
      Math.random() > this.breakdownSeverity / repair ||
      Math.random() * this.needsRepairAt < repair
        ? base
        : deadCharacters[Math.floor(Math.random() * deadCharacters.length)]

    let grid = []

    let row = []
    row.push('┏')
    for (let rowIndex = 0; rowIndex < range * 4 + 3; rowIndex++) row.push('━')
    row.push('┓')
    grid.push(row)

    for (let rowIndex = 0; rowIndex < range * 2 + 1; rowIndex++) {
      let row = ['┃']
      for (let elIndex = 0; elIndex < range * 2 + 1; elIndex++)
        row.push(getChar(emptySpace))

      if (rowIndex % 2)
        row.push(
          `┠ ${Math.round(range - rowIndex + y)}${process.env.DISTANCE_UNIT}`,
        )
      else {
        row.push(`┃`)
      }

      grid.push(row)
    }

    row = []
    row.push('┗┯')
    for (let rowIndex = 0; rowIndex < range * 4 + 1; rowIndex++) row.push('━')
    row.push('┯┛')
    grid.push(row)

    row = []
    const leftLabel = x - range + process.env.DISTANCE_UNIT
    const rightLabel = x + range + process.env.DISTANCE_UNIT
    row.push(
      leftLabel.padEnd(range * 4 + 5 - rightLabel.length, ' ') + rightLabel,
    )
    grid.push(row)

    grid[range + 1][range + 1] = getChar('🚀')

    for (let cache of scanResult.caches) {
      const xDiff = cache.location[0] - x
      const yDiff = cache.location[1] - y
      const scanCenter = range + 1
      const cacheXPosition = Math.round(scanCenter + xDiff)
      const cacheYPosition = Math.round(scanCenter - yDiff)
      grid[cacheYPosition][cacheXPosition] = getChar('📦')
    }

    for (let otherGuild of scanResult.guilds) {
      const xDiff = otherGuild.ship.location[0] - x
      const yDiff = otherGuild.ship.location[1] - y
      const scanCenter = range + 1
      const otherGuildXPosition = Math.round(scanCenter + xDiff)
      const otherGuildYPosition = Math.round(scanCenter - yDiff)
      grid[otherGuildYPosition][otherGuildXPosition] = getChar('🛸')
    }

    for (let planet of scanResult.planets) {
      const xDiff = planet.location[0] - x
      const yDiff = planet.location[1] - y
      const scanCenter = range + 1
      const planetXPosition = Math.round(scanCenter + xDiff)
      const planetYPosition = Math.round(scanCenter - yDiff)
      grid[planetYPosition][planetXPosition] = getChar('🌖')
    }

    let map = grid.map((row) => row.join('')).join('\n')

    if (scanResult.guilds.length)
      map =
        map +
        `\n> SHIPS_FOUND=${scanResult.guilds
          .map((g) => g.ship.name.replace(/ /g, '_').toUpperCase())
          .join(',')}`
    if (scanResult.planets.length)
      map =
        map +
        `\n> PLANETS_FOUND=${scanResult.planets
          .map((p) => p.name.replace(/ /g, '_').toUpperCase())
          .join(',')}`

    let key = [`🚀 Us`]
    key.push(`🌖 Planet`)
    // if (scanResult.length)
    key.push(`🛸 Spacecraft`)
    key.push(`📦 Cache`)

    if (repair < this.needsRepairAt) {
      key.push(`❌ Not Sure`)
      map = map + `\n> SYSTEM_REPAIR_AT_${(repair * 100).toFixed(0)}%`
    }

    return {
      map,
      key,
      model: this.displayName,
      repair,
    }
  },
}
