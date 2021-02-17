const send = require('../actions/send')
const { log } = require('../botcommon')

module.exports = {
  tag: 'useThisChannel',
  captain: true,
  documentation: {
    name: `usethischannel`,
    value: `Sets the bot's channel for push messages.`,
    emoji: '🗯',
    category: 'settings',
    priority: 0,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:usethischannel)$`, 'gi').exec(
      content,
    )
  },
  async action({ msg, settings, client, guild }) {
    log(msg, 'Use This Channel', msg.channel.name)
    const res = await guild.setChannel(msg.channel.id)
    return send(msg, res.message)
  },
}
