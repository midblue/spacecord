module.exports = {
  emoji: `🔭`,
  description: `Not so much high-tech as medieval-tech, this is a digital telescope mounted to your ship that can peer at nearby craft. It can't tell much about them, but it's at least reliable for determining the size and faction of other ships. Its one adantage is that it is very hard to detect.`,
  displayName: `Telescopic Inspector`,
  baseHp: 5,
  powerUse: 1,
  requirements: { engineering: 4 },
  scanUndetectability: 50,
  durabilityLostOnUse: 0.01,
  use (otherShip) {
    const previousRepair = this.repair
    this.repair = (this.repair ?? 1) - (this.durabilityLostOnUse ?? 0.01)
    if (this.repair < 0) this.repair = 0

    const repair = this.repair

    if (repair <= 0) {
      if (previousRepair !== repair) { guild.ship.logEntry(story.repair.breakdown(this.displayName)) }
      return {
        ok: false,
        message: story.repair.breakdown(this.displayName)
      }
    }

    return {
      ok: true,
      result: [
        {
          name: `📛 Name`,
          value: otherShip.name
        },
        {
          name: `Faction`,
          value:
            otherShip.guild.faction.emoji + ` ` + otherShip.guild.faction.name
        },
        {
          name: `👨‍👩‍👦‍👦 Crew Members`,
          value: otherShip.members.length
        },
        {
          name: `Chassis`,
          value:
            otherShip.equipment.chassis[0].emoji +
            otherShip.equipment.chassis[0].displayName
        },
        {
          name: `🇨🇭 Max HP`,
          value: otherShip.maxHp()
        }
      ]
    }
  }
}
