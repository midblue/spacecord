const { numberToEmoji, percentToTextBars } = require(`../../../../common`)
const generateImage = require("../../../../imageGen/generateImage")

module.exports = {
  emoji: `📽`,
  description: `testing`,
  displayName: `image 1`,
  baseHp: 15,
  powerUse: 0,
  range: 5,
  needsRepairAt: 0.1,
  breakdownSeverity: 0.05,
  repairRequirements: { mechanics: 4 },
  requirements: { engineering: 2 },
  async use ({ scanResult, x, y, range, guild }) {
    const previousRepair = this.repair
    this.repair = (this.repair ?? 1) - (this.durabilityLostOnUse ?? 0.01)
    if (this.repair < 0) this.repair = 0

    const repair = this.repair

    if (repair <= 0) {
      if (previousRepair !== repair) { guild.ship.logEntry(story.repair.breakdown(this.displayName)) }
      return {
        map: `
*******************
**               **
**  BROKEN_DOWN  **
** PLEASE_REPAIR **
**               **
**               **
*******************`,
        key: [],
        model: this.displayName,
        repair
      }
    }

    const map = await generateImage('scan1', {
      range,
      ship: guild.saveableData().ship, 
      planets: scanResult.planets.map(p => ({...p, context: undefined})), 
      ships: scanResult.guilds.map(g => g.saveableData().ship), 
      caches: scanResult.caches
    })

    const key = [`🚀 Us`]
    // key.push(`🪐 Planet`)
    // // if (scanResult.length)
    // key.push(`🛸 Spacecraft`)
    // key.push(`📦 Cache`)

    // if (repair < this.needsRepairAt) {
    //   key.push(`❌ Not Sure`)
    //   map += `\n> SYSTEM_REPAIR_AT_${(repair * 100).toFixed(0)}%`
    // }

    return {
      image: true,
      map,
      key,
      model: this.displayName,
      repair
    }
  }
}
