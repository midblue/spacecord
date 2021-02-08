const send = require('../actions/send')
const { log } = require('../botcommon')

module.exports = {
  tag: 'joinCrew',
  public: true,
  documentation: {
    name: `join`,
    value: `Become a member of the ship's crew.`,
    emoji: '💪',
    category: 'crew',
    priority: 95,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:j|join)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game, ship }) {
    log(msg, 'Join Crew', msg.guild.name)

    const res = await ship.addCrewMember(msg.author)
    send(msg, res.message)
  },
}
