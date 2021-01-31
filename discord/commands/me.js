const auth = require('registry-auth-token')
const send = require('../actions/send')
const { log } = require('../botcommon')

module.exports = {
  tag: 'me', // this is also the 'train' command
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:me|train)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game, client, ship, authorCrewMemberObject }) {
    log(msg, 'Me', msg.guild.name)
    // my skills, my options to train things, etc
    send(msg, JSON.stringify(authorCrewMemberObject, null, 2))
  },
}
