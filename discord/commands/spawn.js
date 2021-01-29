const send = require('../actions/send')
const { log } = require('../common')

module.exports = {
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:spawn)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game }) {
    log(msg, 'Spawn', msg.guild.name)

    const res = await game.spawn(msg.guild)
    send(msg, res.message)

    if (!res.ok) return
    const res2 = await game.addCrewMember({
      discordUser: msg.author,
      guildId: msg.guild.id,
    })
    send(msg, res2.message)
  },
}
