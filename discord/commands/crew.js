const send = require('../actions/send')
const { log, username } = require('../botcommon')

module.exports = {
  tag: 'crew',
  documentation: {
    value: `Lists the ship's crew, leadership, and top scorers.`,
    emoji: '👨‍👩‍👧‍👦',
    category: 'crew',
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:crew|c)$`, 'gi').exec(content)
  },
  async action({
    msg,
    settings,
    game,
    client,
    ship,
    guild,
    authorCrewMemberObject,
  }) {
    log(msg, 'Crew', msg.guild.name)
    // leaderboards, number of members, top at different skills, etc
    // todo, maybe combine with .ranking
    send(
      msg,
      JSON.stringify(
        await Promise.all(
          ship.members.map(async (m) => await username(msg, m.id)),
        ),
        null,
        2,
      ),
    )
  },
}
