const generateImage = require(`../../../../imageGen/generateImage`)

module.exports = {
  emoji: `📽`,
  description: `An old-fashioned radar-based telemetry system salvaged from imperial craft after the battle of Hera's Pass. These short-range area scanners are reliable and cheap, but tricky to repair.`,
  displayName: `Radiation Imprint Radar Mk.001`,
  baseHp: 15,
  powerUse: 2,
  range: 0.25,
  needsRepairAt: 0.5,
  breakdownSeverity: 0.05,
  repairRequirements: { mechanics: 5 },
  repairDifficulty: 1.5,
  requirements: { engineering: 2 },
  async use({ scanResult, x, y, range, guild }) {
    const previousRepair = this.repair
    this.repair = (this.repair ?? 1) - (this.durabilityLostOnUse ?? 0.01)
    if (this.repair < 0) this.repair = 0

    const repair = this.repair

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
**               **
*******************`,
        key: [],
        model: this.displayName,
        repair,
      }
    }

    const guildData = guild.saveableData()
    const map = await generateImage(`scan1`, {
      label: this.displayName,
      radius: range,
      center: guild.ship.location,
      guilds: [
        ...scanResult.guilds.map((g) => ({
          ...g.saveableData(),
          color: `red`,
        })),
        { ...guildData, ship: { ...guildData.ship, name: null } },
      ],
      radii: [
        { label: `attack`, color: `#fb0`, radius: guild.ship.attackRadius() },
        {
          label: `interact`,
          color: `#fb0`,
          radius: guild.ship.interactRadius(),
        },
        {
          label: `scan ship`,
          color: `#fb0`,
          radius: guild.ship.shipScanRadius(),
        },
      ],
      planets: scanResult.planets.map((p) => ({ ...p, context: undefined })),
      caches: scanResult.caches,
      repair: repair / this.needsRepairAt,
    })

    const key = [`⬜️ Us`, `🟢 Planet`, `🟨 Cache`, `🟥 Ship`]

    let repairMessage
    if (repair < this.needsRepairAt) {
      key.push(`🟪 Not Sure`)
      repairMessage = `> SYSTEM_REPAIR_AT_${(repair * 100).toFixed(0)}%`
    }

    return {
      image: true,
      map,
      repairMessage,
      key,
      model: this.displayName,
      repair,
    }
  },
}
