const send = require('../actions/send')
const { log } = require('../botcommon')
const story = require('../../game/basics/story/story')
const { guild } = require('../../game/manager')

module.exports = {
  tag: 'spawn',
  public: true,
  admin: true,
  noShip: true,
  documentation: {
    value: 'Adds your server\'s ship into the game!',
    emoji: '🏁',
    category: 'settings',
    priority: 90
  },
  test (content, settings) {
    return new RegExp(`^${settings.prefix}(?:r?e?spawn)$`, 'gi').exec(content)
  },
  async action ({ msg, settings, game, authorIsAdmin }) {
    log(msg, 'Spawn', msg.guild.name)

    const res = await game.spawn({
      discordGuild: msg.guild,
      channelId: msg.channel.id
    })
    if (res.ok) {
      send(msg, res.message)
      const res2 = await res.guild.ship.addCrewMember(msg.author)
      send(msg, res2.message)
    } else if (res.guild.ship.status.dead) {
      if (authorIsAdmin || res.guild.ship.captain === msg.author.id) { res.guild.ship.respawn(msg) } else send(msg, 'Only the captain or a server admin can respawn the ship.')
    } else {
      send(msg, res.message)
    }
  }
}
