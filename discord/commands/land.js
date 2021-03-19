const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const nearby = require(`./nearby`)
const planet = require(`./planet`)

module.exports = {
  tag: `land`,
  pmOnly: true,
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:land)$`, `gi`).exec(content)
  },
  async action({ msg, settings, client, guild }) {
    log(msg, `Land`, msg.guild?.name)

    if (guild.ship.status.docked) {
      return planet.action({ msg, settings, client, guild })
    }

    nearby.action({ msg, guild, filter: `planets` })
  },
}
