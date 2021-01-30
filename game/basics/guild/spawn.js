module.exports = function ({ discordGuild, channelId }) {
  const ship = {
    name: 'HMS Fanniel Bomb',
    launched: Date.now(),
    model: 'shipA',
    credits: 50,
    status: 'flying',
    power: 11,
    members: [],
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
      battery: [
        {
          id: 'upgrade/battery1',
          performance: 0.7,
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
    location: [Math.random() * 4, Math.random() * 4],
    bearing: [Math.random() - 0.5, Math.random() - 0.5],
    speed: 0.01,
  }

  const data = {
    guildId: discordGuild.id,
    guildName: discordGuild.name,
    channel: channelId,
    ship,
    created: Date.now(),
  }
  return data
}
