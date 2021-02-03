const defaultServerSettings = require('../../../discord/defaults/defaultServerSettings')

module.exports = function ({ discordGuild, channelId }) {
  const ship = {
    name: 'HMS Fanniel Bomb',
    launched: Date.now(),
    model: 'shipA',
    credits: 50,
    status: {
      flying: true,
    },
    power: 11,
    faction: Math.floor(Math.random() * 3),
    members: [],
    equipment: {
      engine: [
        {
          id: 'basic1',
          bought: Date.now(),
          maintained: Date.now(),
          repair: 0.8,
        },
      ],
      telemetry: [
        {
          id: 'telemetry1',
          repair: 0.6,
        },
      ],
      battery: [
        {
          id: 'battery1',
          repair: 1,
        },
      ],
    },
    cargo: [
      {
        type: 'fuel',
        amount: 8,
      },
      {
        type: 'food',
        amount: 2,
      },
    ],
    location: [Math.random() * 4, Math.random() * 4],
    bearing: [Math.random() - 0.5, Math.random() - 0.5],
    speed: 0,
  }

  const data = {
    guildId: discordGuild.id,
    guildName: discordGuild.name,
    channel: channelId,
    ship,
    created: Date.now(),
    settings: { ...defaultServerSettings },
  }
  return data
}
