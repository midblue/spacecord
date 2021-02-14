const { msToTimeString } = require('../../common')
const send = require('../actions/send')
const { log } = require('../botcommon')

module.exports = {
  tag: 'nextTick',
  documentation: {
    name: 'nexttick',
    value: `Displays the time until the next game tick.`,
    emoji: '⏱',
    category: 'settings',
    priority: 10,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:next|tick|nexttick|nextday)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, settings, game }) {
    log(msg, 'Next Tick', msg.guild.name)

    const res = msToTimeString(game.timeUntilNextTick())
    send(msg, `${res} until the next ${process.env.TIME_UNIT_SINGULAR}.`)
  },
}
