const send = require('../actions/send')
const { log } = require('../botcommon')
const { numberToEmoji, capitalize } = require('../../common')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js')
const story = require('../../game/basics/story/story')

module.exports = {
  tag: 'nearbyShips',
  documentation: {
    name: 'nearbyships',
    value: `Inspect and interact with nearby ships.`,
    emoji: '🛸',
    priority: 60,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:nearbyships?|nearby|near)$`,
      'gi',
    ).exec(content)
  },
  async action({
    msg,
    settings,
    game,
    ship,
    guild,
    authorCrewMemberObject,
    author,
    interactableGuilds,
  }) {
    log(msg, 'Nearby Ships', msg.guild.name)

    if (interactableGuilds === undefined)
      interactableGuilds = guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range: guild.ship.interactRadius || process.env.INTERACT_RADIUS,
        excludeIds: guild.guildId,
      }).guilds

    if (interactableGuilds.length === 0)
      return send(msg, story.interact.noShips())

    interactableGuilds.forEach(async (otherGuild) => {
      const embed = new Discord.MessageEmbed()
        .setColor(process.env.APP_COLOR)
        .setTitle('🛸 ' + otherGuild.ship.name)
        .setDescription('XX AU away from you at an angle of XX degrees')

      const availableActions = guild.ship.getActionsOnOtherGuild(otherGuild)

      const sentMessages = await send(msg, embed)
      const sentMessage = sentMessages[sentMessages.length - 1]
      await awaitReaction({
        msg: sentMessage,
        reactions: availableActions,
        actionProps: { otherGuild },
        embed,
        guild,
      })
    })
  },
}
