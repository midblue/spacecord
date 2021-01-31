const auth = require('registry-auth-token')
const send = require('../actions/send')
const { log } = require('../botcommon')

module.exports = {
  tag: 'me', // this is also the 'train' command
  documentation: {
    value: `See your skills, stats, training options, etc.`,
    emoji: '💁‍♂️',
    priority: 70,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:me|train)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game, client, ship, authorCrewMemberObject }) {
    log(msg, 'Me', msg.guild.name)
    // my skills, my options to train things, etc
    send(msg, JSON.stringify(authorCrewMemberObject, null, 2))
  },
}
