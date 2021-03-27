module.exports = {
  emoji: `🔭`,
  description: `Not so much high-tech as medieval-tech, this is a digital telescope mounted to your ship that can peer at nearby craft. It can't tell much about them, but it's at least reliable for determining the size and faction of other ships. Its one adantage is that it is very hard to detect.`,
  displayName: `Telescopic Inspector`,
  baseHp: 5,
  mass: 50,
  powerUse: 1,
  requirements: { engineering: 4 },
  scanUndetectability: 50,
  durabilityLostOnUse: 0.01,
  use(otherShip) {
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
          name: `Chassis`,
          value:
            otherShip.equipment.find((e) => e.equipmentType === `chassis`)
              .list[0].emoji +
            otherShip.equipment.find((e) => e.equipmentType === `chassis`)
              .list[0].displayName,
        },
        {
          name: `🇨🇭 Max HP`,
          value: otherShip.maxHp(),
        },
      ],
    }
  },
}
