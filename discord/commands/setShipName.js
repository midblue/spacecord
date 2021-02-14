const send = require('../actions/send')
const { log } = require('../botcommon')
const { checkUserInputForBadWords } = require('../../common')
const Discord = require('discord.js-light')

module.exports = {
  tag: 'setShipName',
  captain: true,
  documentation: {
    name: `setshipname <ship name>`,
    value: `Sets your ship's name.`,
    emoji: '📛',
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
    if (name.length < 3) return send(msg, `That name is too short!`)
    if (name.length < 24) return send(msg, `That name is too long!`)
    const textCheck = checkUserInputForBadWords(name)
    if (!textCheck.ok) return send(msg, textCheck.message)
    if (name === 'God') return send(msg, `That is a reserved name.`)
    const res = await guild.ship.setName(name)
    return send(msg, res.message)
  },
}
