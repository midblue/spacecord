const ships = {
  shipA: {
    baseHp: 100,
    baseCost: 2000,
    baseScanRange: 1,
    modelDisplayName: 'Model D',
    equipmentSlots: {
      weapon: {
        small: 1,
      },
      engine: {
        small: 2,
        large: 1,
      },
      upgrades: {
        small: 1,
      },
    },
    cargoSpace: 50,
  },
}

module.exports = ships
