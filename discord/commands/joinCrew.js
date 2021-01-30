const send = require('../actions/send')
const { log } = require('../botcommon')

module.exports = {
  tag: 'joinCrew',
  public: true,
  noShip: true,
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:join)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game }) {
    log(msg, 'Spawn', msg.guild.name)

    const res = await game.addCrewMember({
      discordUser: msg.author,
      guildId: msg.guild.id,
    })
    send(msg, res.message)
  },
}
