const send = require('../actions/send')
const { log } = require('../botcommon')

module.exports = {
  tag: 'spawn',
  public: true,
  admin: true,
  noShip: true,
  documentation: {
    value: `Adds your server's ship into the game!`,
    emoji: '🏁',
    priority: 90,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:spawn)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game }) {
    log(msg, 'Spawn', msg.guild.name)

    const res = await game.spawn({
      discordGuild: msg.guild,
      channelId: msg.channel.id,
    })
    send(msg, res.message)

    if (!res.ok) return
    const res2 = await game.addCrewMember({
      discordUser: msg.author,
      guildId: msg.guild.id,
    })
    send(msg, res2.message)
  },
}
