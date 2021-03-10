const send = require(`../actions/send`)
const { log, applyCustomParams } = require(`../botcommon`)
const Discord = require(`discord.js-light`)

module.exports = {
  tag: `log`,
  pm: true,
  // documentation: {
  //   name: `log`,
  //   value: `Consult the ship's log of events.`,
  //   emoji: `🧾`,
  //   category: `ship`,
  //   priority: 50
  // },
  test(content, settings) {
    return false
    // return new RegExp(
    //   `^${settings.prefix}(?:l|log|journal|shiplog)$`,
    //   `gi`
    // ).exec(content)
  },
  async action({ msg, settings, client, ship }) {
    log(msg, `Log`, msg.guild?.name)
    const res = ship.getLog(10)
    const text = await applyCustomParams(msg, res.message)
    return send(msg, text)
  },
}
