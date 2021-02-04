const send = require('../actions/send')
const { log } = require('../botcommon')
const { checkForHateSpeech } = require('../../common')
const Discord = require('discord.js')

module.exports = {
  tag: 'setShipName',
  admin: true,
  documentation: {
    name: `setshipname <ship name>`,
    value: `Sets your ship's name.`,
    emoji: '📛',
    category: 'settings',
    priority: 80,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:setshipname|shipname) (.*)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, match, settings, client, guild }) {
    log(msg, 'Set Ship Name', msg.channel.name)
    let name = match[1]
    name = name.replace(/(?:^<|>$)/gi, '')
    const hateSpeechCheck = checkForHateSpeech(name)
    if (!hateSpeechCheck.ok) return send(msg, hateSpeechCheck.message)
    const res = await guild.ship.setName(name)
    return send(msg, res.message)
  },
}
