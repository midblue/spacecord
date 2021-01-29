const shipsData = require('./ships')
const equipmentData = require('./equipment')

function spawn(guild) {
  const ship = {
    name: 'our ship',
    launched: Date.now(),
    model: 'shipA',
    credits: 50,
    equipment: {
      engine: [
        {
          id: 'engine/basic1',
          bought: Date.now(),
          maintained: Date.now(),
          performance: 0.8,
        },
      ],
      upgrade: [
        {
          id: 'upgrade/telemetry1',
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
    location: [0, 0],
    bearing: [1, 0],
    speed: 1,
  }

  const members = []

  const data = {
    guildId: guild.id,
    guildName: guild.name,
    ship,
    members,
    created: Date.now(),
  }
  liveify(data)
  return data
}

function liveify(baseGuildObject) {
  baseGuildObject.statusReport = () => {
    return JSON.stringify(baseGuildObject, null, 2)
  }

  baseGuildObject.update = (updates) => {
    console.log('updating', this.baseGuildObject.guildId, updates)
  }

  // add base properties to items onboard
  Object.keys(baseGuildObject.ship.equipment || {}).forEach((equipmentType) => {
    baseGuildObject.ship.equipment[
      equipmentType
    ] = baseGuildObject.ship.equipment[equipmentType]
      .map((part) => {
        const itemData = equipmentData[part.id]
        if (itemData) return // todo
        return {
          ...part,
          ...itemData,
        }
      })
      .filter((p) => p)
    return {
      ...baseGuildObject.ship,
      server: {
        id: baseGuildObject.guildId,
        name: baseGuildObject.guildName,
      },
      ...shipsData[baseGuildObject.ship.id],
    }
  })
}

module.exports = {
  spawn,
}
