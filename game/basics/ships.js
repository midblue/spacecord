const ships = {
  shipA: {
    baseHp: 100,
    baseCost: 2000,
    modelDisplayName: 'Model D',
    equipmentSlots: {
      // todo
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
    cargoSpace: 20,
  },
}

module.exports = ships
