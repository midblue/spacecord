const items = {
  engine: {
    basic1: {
      emoji: '⚙️',
      modelDisplayName: 'Sparkler 1000',
      maxSpeed: 0.5,
      fuelUse: 1,
      directions: 4,
      powerLevels: 2,
      requirements: { piloting: 2 },
    },
  },
  telemetry: {
    // todo some of these have "auto-notify" when you come in range of a new thing

    telemetry1: {
      // emoji: '📡',
      emoji: '😜',
      modelDisplayName: 'Emoji Scanner v1',
      powerUse: 0.5,
      range: 5,
      needsRepairAt: 0.8,
      breakdownSeverity: 0.02, // Math.random() > this to run mistake check
      repairRequirements: { mechanics: 4 },
      requirements: { engineering: 2 },
      use({ scanResult, x, y }) {
        const repair = this.repair ?? 1,
          range = this.range

        console.log(repair)

        const emptySpace = '  '

        const deadCharacters = [
          '❌',
          '❌',
          '❌',
          '❌',
          '❌',
          '❌',
          '❌',
          '❌',
          '🛸',
        ]

        const getChar = (base) =>
          Math.random() > this.breakdownSeverity ||
          Math.random() * this.needsRepairAt < repair
            ? base
            : deadCharacters[Math.floor(Math.random() * deadCharacters.length)]

        let grid = []

        let row = []
        for (let rowIndex = 0; rowIndex < range * 2 + 2; rowIndex++)
          row.push('__')
        grid.push(row)

        for (let rowIndex = 0; rowIndex < range * 2 + 1; rowIndex++) {
          let row = ['|']
          for (let elIndex = 0; elIndex < range * 2 + 1; elIndex++)
            row.push(getChar(emptySpace))
          row.push('|')
          grid.push(row)
        }

        row = []
        for (let rowIndex = 0; rowIndex < range * 2 + 2; rowIndex++)
          row.push('‾‾')
        grid.push(row)

        grid[range + 1][range + 1] = getChar('🚀')

        for (let otherGuild of scanResult) {
          const xDiff = otherGuild.ship.location[0] - x
          const yDiff = otherGuild.ship.location[1] - y
          const scanCenter = range + 1
          const otherGuildXPosition = Math.round(scanCenter + xDiff)
          const otherGuildYPosition = Math.round(scanCenter - yDiff)
          grid[otherGuildYPosition][otherGuildXPosition] = getChar('🛸')
        }

        let map = grid.map((row) => row.join('')).join('\n')

        let key = [`🚀 Us`]
        // if (scanResult.length)
        key.push(`🛸 Spacecraft`)

        if (repair < this.needsRepairAt) {
          key.push(`❓ Not Sure`)
          map = map + `\n> SYSTEM_REPAIR_AT_${(repair * 100).toFixed(0)}%`
        }

        return {
          map,
          key,
          model: this.modelDisplayName,
        }
      },
    },
  },
  battery: {
    battery1: {
      emoji: '🔋',
      modelDisplayName: 'Double D Mark II',
      capacity: 20,
    },
  },
}

module.exports = items
