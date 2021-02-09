const { numberToEmoji, percentToTextBars } = require('../../../../common')

module.exports = {
  emoji: '🔍',
  modelDisplayName: 'Telescopic Inspector',
  baseHp: 5,
  powerUse: 2,
  requirements: { engineering: 4 },
  scanUndetectability: 5,
  durabilityLostOnUse: 0.01,
  use(otherShip) {
    const previousRepair = this.repair
    this.repair = (this.repair ?? 1) - (this.durabilityLostOnUse ?? 0.01)
    if (this.repair < 0) this.repair = 0

    const repair = this.repair

    if (repair <= 0) {
      if (previousRepair !== repair)
        guild.ship.logEntry(story.repair.breakdown(this.modelDisplayName))
      return {
        ok: false,
        message: story.repair.breakdown(this.modelDisplayName),
      }
    }

    return {
      ok: true,
      result: [
        {
          name: '📛 Name',
          value: otherShip.name,
        },
        {
          name: '👨‍👩‍👦‍👦 Faction',
          value: otherShip.faction.emoji + ' ' + otherShip.faction.name,
        },
        {
          name: '🇨🇭 Max Possible HP',
          value: otherShip.maxHp(),
        },
      ],
    }
  },
}
