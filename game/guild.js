function spawn(guild) {
  const ships = [
    {
      name: 'our ship',
      server: {
        id: guild.id,
        name: guild.name,
      },
      launched: Date.now(),
      ship: {
        model: 'shipA',
        credits: 50,
        equipment: {
          engine: [
            {
              name: 'basic 1',
              bought: Date.now(),
              maintained: Date.now(),
              performance: 0.8,
            },
          ],
          upgrades: [
            {
              name: 'telemetry 1',
              performance: 0.9,
            },
          ],
        },
        cargo: [
          {
            type: 'metal',
            amount: 10,
          },
          {
            type: 'fuel',
            amount: 20,
          },
          {
            type: 'food',
            amount: 10,
          },
        ],
      },
      location: [0, 0],
      bearing: [1, 0],
      speed: 1,
    },
  ]

  const members = []

  return {
    ships,
    members,
    created: Date.now(),
  }
}

module.exports = {
  spawn,
}
