const { percentToTextBars } = require(`../../../../common`)

module.exports = {
  emoji: `🔬`,
  description: `asdf`,
  displayName: `Ship Scanner 2`,
  baseHp: 7,
  mass: 150,
  range: 0.15,
  powerUse: 2,
  requirements: { engineering: 6 },
  scanUndetectability: 15,
  durabilityLostOnUse: 0.01,
  use(otherShip) {
    const previousRepair = this.repair
    this.repair = (this.repair ?? 1) - (this.durabilityLostOnUse ?? 0.01)
    if (this.repair < 0) this.repair = 0

    const repair = this.repair

    if (repair <= 0) {
      if (previousRepair !== repair) {
        guild.ship.logEntry(story.repair.breakdown(this.displayName))
      }
      return {
        ok: false,
        message: story.repair.breakdown(this.displayName),
      }
    }

    return {
      ok: true,
      result: [
        {
          name: `📛 Name`,
          value: otherShip.name,
        },
        {
          name: `Faction`,
          value:
            otherShip.guild.faction.emoji + ` ` + otherShip.guild.faction.name,
        },
        {
          name: `👨‍👩‍👦‍👦 Crew Members`,
          value: otherShip.members.length,
        },
        {
          name: `👵🏽 Ship Age`,
          value:
            ((Date.now() - otherShip.launched) / TIME_UNIT_LONG_LENGTH).toFixed(
              2,
            ) +
            ` ` +
            TIME_UNIT_LONGS,
        },
        {
          name: `Chassis`,
          value:
            otherShip.equipment.find((e) => e.equipmentType === `chassis`)
              .list[0].emoji +
            otherShip.equipment.find((e) => e.equipmentType === `chassis`)
              .list[0].displayName,
        },
        {
          name: `🇨🇭 HP`,
          value:
            percentToTextBars(otherShip.currentHp() / otherShip.maxHp()) +
            `\n${Math.round(otherShip.currentHp())} / ${Math.round(
              otherShip.maxHp(),
            )}`,
        },
        // {
        //   name: `🔫 Weapons`,
        //   value:
        //     ,
        // },
      ],
    }
  },
}
