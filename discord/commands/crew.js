const send = require('../actions/send')
const { log, username } = require('../botcommon')

module.exports = {
  tag: 'crew',
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:crew)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game, client, ship, authorCrewMemberObject }) {
    log(msg, 'Crew', msg.guild.name)
    // leaderboards, number of members, top at different skills, etc
    send(
      msg,
      JSON.stringify(
        ship.members.map((m) => username(m.id)),
        null,
        2,
      ),
    )
  },
}
