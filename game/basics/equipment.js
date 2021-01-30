const items = {
  'engine/basic1': {
    modelDisplayName: 'Sparkler 1000',
    power: 1,
    fuelUse: 1,
    directions: 4,
    powerLevels: 2,
  },
  'upgrade/telemetry1': {
    modelDisplayName: 'Emoji Scanner v1',
    powerUse: 0.5,
    range: 5,
    use({ scanResult, x, y }) {
      const data = [
        { name: 'Our Coordinates', value: `${x.toFixed(2)}, ${y.toFixed(2)}` },
        { name: 'Scan Radius', value: `${this.range} units` },
        { name: 'Power Use', value: this.powerUse },
      ]
      // todo make unreliable — tosses in random emojis without warning etc

      let grid = []

      let row = []
      for (let rowIndex = 0; rowIndex < this.range * 2 + 2; rowIndex++)
        row.push('__')
      grid.push(row)

      for (let rowIndex = 0; rowIndex < this.range * 2 + 1; rowIndex++) {
        let row = ['|']
        for (let elIndex = 0; elIndex < this.range * 2 + 1; elIndex++)
          row.push('  ')
        row.push('|')
        grid.push(row)
      }

      row = []
      for (let rowIndex = 0; rowIndex < this.range * 2 + 2; rowIndex++)
        row.push('‾‾')
      grid.push(row)

      grid[this.range + 1][this.range + 1] = '🚀'

      for (let otherGuild of scanResult) {
        const xDiff = otherGuild.ship.location[0] - x
        const yDiff = otherGuild.ship.location[1] - y
        const scanCenter = this.range + 1
        const otherGuildXPosition = Math.round(scanCenter + xDiff)
        const otherGuildYPosition = Math.round(scanCenter - yDiff)
        grid[otherGuildYPosition][otherGuildXPosition] = '🛸'
      }

      let key = [`🚀 Us`]
      if (scanResult.length) key.push(`🛸 Unidentified Craft`)

      return {
        map: grid.map((row) => row.join('')).join('\n'),
        data,
        key,
        model: this.modelDisplayName,
      }
    },
  },
  'upgrade/battery1': {
    modelDisplayName: 'Double D Mark II',
    capacity: 20,
  },
}

module.exports = items
