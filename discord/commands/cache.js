const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const nearby = require(`./nearby`)

module.exports = {
  tag: `cache`,
  test (content, settings) {
    return new RegExp(`^${settings.prefix}(?:caches?)$`, `gi`).exec(content)
  },
  async action ({ msg, guild }) {
    log(msg, `Cache`, msg.guild.name)
    nearby.action({ msg, guild, filter: `caches` })
  }
}
