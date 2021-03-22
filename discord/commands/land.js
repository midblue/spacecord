const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const nearby = require(`./nearby`)
const runGuildCommand = require(`../actions/runGuildCommand`)

module.exports = {
  tag: `land`,
  pmOnly: true,
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:land)$`, `gi`).exec(content)
  },
  async action({ msg, settings, client, guild, authorCrewMemberObject }) {
    log(msg, `Land`, msg.guild?.name)

    if (guild.ship.status.docked)
      return runGuildCommand({
        msg,
        commandTag: `planet`,
      })

    return runGuildCommand({
      msg,
      commandTag: `nearby`,
      props: { filter: `planets` },
    })
  },
}
