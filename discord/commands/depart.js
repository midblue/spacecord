const { log } = require(`../botcommon`)
const depart = require(`../actions/depart`)

module.exports = {
  tag: `depart`,
  test (content, settings) {
    return new RegExp(`^${settings.prefix}(?:depart|leave|liftoff|blastoff)$`, `gi`).exec(content)
  },
  async action ({ msg, guild }) {
    log(msg, `Depart`, msg.guild.name)

    if (!guild.ship.status.docked)
      return

    depart({ msg, guild })
  }
}