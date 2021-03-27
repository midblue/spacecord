const { numberToEmoji, percentToTextBars } = require(`../../../../common`)

module.exports = {
  // emoji: '📡',
  emoji: `😜`,
  description: `First designed as a joke, but then seriously adopted for its clarity and readability by even the most knuckleheaded Zoomer crew members, the Emoji Radar has earned a certain unique type of esteem in the galaxy.`,
  displayName: `Emoji Radar v1`,
  baseHp: 15,
  powerUse: 2,
  range: 4,
  needsRepairAt: 0.8,
  breakdownSeverity: 0.05,
  repairRequirements: { mechanics: 4 },
  requirements: { engineering: 6 },
  use({ scanResult, x, y }) {
    const previousRepair = this.repair
    this.useDurability()

    const repair = this.repair
    const range = this.range

    if (repair <= 0) {
      if (previousRepair !== repair) {
        guild.ship.logEntry(story.repair.breakdown(this.displayName))
      }
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

    const emptySpace = `⬛`

    const deadCharacters = [
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      `❌`,
      emptySpace,
      emptySpace,
      emptySpace,
      emptySpace,
      emptySpace,
      emptySpace,
      `🛸`,
      `🪐`,
    ]

    const getChar = (base) =>
      Math.random() > this.breakdownSeverity / repair ||
      Math.random() * this.needsRepairAt < repair
        ? base
        : deadCharacters[Math.floor(Math.random() * deadCharacters.length)]

    const grid = []

    let row = []
    row.push(`┏`)
    for (let rowIndex = 0; rowIndex < range * 4 + 4; rowIndex++) row.push(`━`)
    row.push(`┓`)
    grid.push(row)

    for (let rowIndex = 0; rowIndex < range * 2 + 1; rowIndex++) {
      const row = [`┃`]
      for (let elIndex = 0; elIndex < range * 2 + 1; elIndex++) {
        row.push(getChar(emptySpace))
      }

      if (rowIndex % 2) row.push(`┠ ${Math.round(range - rowIndex + y)}`)
      else {
        row.push(`┃`)
      }

      grid.push(row)
    }

    row = []
    row.push(`┗┯`)
    for (let rowIndex = 0; rowIndex < range * 4 + 2; rowIndex++) row.push(`━`)
    row.push(`┯┛`)
    grid.push(row)

    row = []
    const leftLabel = `${Math.round(x - range)}`
    const rightLabel = `${Math.round(x + range)}`
    row.push(
      leftLabel.padEnd(range * 4 + 5 - rightLabel.length, ` `) + rightLabel,
    )
    grid.push(row)

    grid[range + 1][range + 1] = getChar(`🚀`)

    for (const cache of scanResult.caches) {
      const xDiff = cache.location[0] - x
      const yDiff = cache.location[1] - y
      const scanCenter = range + 1
      const cacheXPosition = Math.round(scanCenter + xDiff)
      const cacheYPosition = Math.round(scanCenter - yDiff)
      grid[cacheYPosition][cacheXPosition] = getChar(`📦`)
    }

    for (const otherGuild of scanResult.guilds) {
      const xDiff = otherGuild.ship.location[0] - x
      const yDiff = otherGuild.ship.location[1] - y
      const scanCenter = range + 1
      const otherGuildXPosition = Math.round(scanCenter + xDiff)
      const otherGuildYPosition = Math.round(scanCenter - yDiff)
      grid[otherGuildYPosition][otherGuildXPosition] = getChar(`🛸`)
    }

    for (const planet of scanResult.planets) {
      const xDiff = planet.location[0] - x
      const yDiff = planet.location[1] - y
      const scanCenter = range + 1
      const planetXPosition = Math.round(scanCenter + xDiff)
      const planetYPosition = Math.round(scanCenter - yDiff)
      grid[planetYPosition][planetXPosition] = getChar(`🪐`)
    }

    let map = grid.map((row) => row.join(``)).join(`\n`)

    if (scanResult.guilds.length) {
      map += `\n> SHIPS_FOUND=${scanResult.guilds
        .map((g) => g.ship.name.replace(/ /g, `_`).toUpperCase())
        .join(`,`)}`
    }
    if (scanResult.planets.length) {
      map += `\n> PLANETS_FOUND=${scanResult.planets
        .map((p) => p.name.replace(/ /g, `_`).toUpperCase())
        .join(`,`)}`
    }

    const key = [`🚀 Us`]
    key.push(`🪐 Planet`)
    // if (scanResult.length)
    key.push(`🛸 Spacecraft`)
    key.push(`📦 Cache`)

    let repairMessage
    if (repair < this.needsRepairAt) {
      key.push(`❌ Not Sure`)
      repairMessage = `\n> SYSTEM_REPAIR_AT_${(repair * 100).toFixed(0)}%`
    }

    return {
      map,
      key,
      model: this.displayName,
      repairMessage,
      repair,
    }
  },
}
